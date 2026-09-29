import { db } from './db';
import { supabase, isSupabaseConfigured } from './supabase';
import { Workout, WorkoutSet, Exercise, SyncQueueItem } from '../types/gym';

export class SyncManager {
  private static isSyncing = false;

  // Dual-write finished workout: Dexie (lifetime) + Supabase (auto-pruned by PG trigger)
  static async saveWorkoutDualWrite(
    workout: Workout,
    sets: WorkoutSet[],
    userId: string
  ): Promise<{ localSuccess: boolean; cloudSuccess: boolean }> {
    let localSuccess = false;
    let cloudSuccess = false;

    // 1. Write to Dexie.js (Zero-latency infinite lifetime storage)
    try {
      await db.transaction('rw', db.workouts, db.workout_sets, async () => {
        await db.workouts.put(workout);
        await db.workout_sets.bulkPut(sets);
      });
      localSuccess = true;
    } catch (err) {
      console.error('Dexie save error:', err);
    }

    // 2. Write to Supabase Cloud (or queue for offline sync)
    if (isSupabaseConfigured && supabase && navigator.onLine) {
      try {
        // Insert workout into Supabase (Prune trigger will execute automatically)
        const { error: wError } = await supabase.from('workouts').upsert({
          id: workout.id,
          user_id: userId,
          title: workout.title,
          split_type: workout.split_type,
          started_at: workout.started_at,
          completed_at: workout.completed_at,
          notes: workout.notes
        });

        if (wError) throw wError;

        // Insert sets
        if (sets.length > 0) {
          const setsPayload = sets.map(s => ({
            id: s.id,
            workout_id: s.workout_id,
            exercise_id: s.exercise_id,
            set_number: s.set_number,
            weight: s.weight,
            reps: s.reps,
            is_completed: s.is_completed,
            created_at: s.created_at
          }));

          const { error: sError } = await supabase.from('workout_sets').upsert(setsPayload);
          if (sError) throw sError;
        }

        cloudSuccess = true;
      } catch (cloudErr) {
        console.warn('Supabase sync failed, enqueuing to offline sync_queue:', cloudErr);
        await this.enqueueSyncItem('workout', 'insert', { workout, sets, userId });
      }
    } else {
      // Offline: Enqueue to Dexie sync queue
      await this.enqueueSyncItem('workout', 'insert', { workout, sets, userId });
    }

    return { localSuccess, cloudSuccess };
  }

  // Update exercise micro-notes in Dexie and Supabase
  static async updateExerciseSettings(exerciseId: string, machineSettings: string, userId?: string) {
    // Local Dexie update
    try {
      await db.exercises.update(exerciseId, { machine_settings: machineSettings });
    } catch (e) {
      console.error('Dexie exercise update failed:', e);
    }

    // Cloud update if configured & online
    if (isSupabaseConfigured && supabase && navigator.onLine) {
      try {
        await supabase
          .from('exercises')
          .update({ machine_settings: machineSettings })
          .eq('id', exerciseId);
      } catch (err) {
        console.warn('Cloud exercise update failed, enqueuing:', err);
        await this.enqueueSyncItem('exercise', 'update', { id: exerciseId, machine_settings: machineSettings });
      }
    } else {
      await this.enqueueSyncItem('exercise', 'update', { id: exerciseId, machine_settings: machineSettings });
    }
  }

  // Save new custom exercise
  static async saveCustomExercise(exercise: Exercise, userId: string) {
    try {
      await db.exercises.put(exercise);
    } catch (e) {
      console.error('Dexie exercise insert failed:', e);
    }

    if (isSupabaseConfigured && supabase && navigator.onLine) {
      try {
        await supabase.from('exercises').upsert({
          id: exercise.id,
          user_id: userId,
          name: exercise.name,
          split_type: exercise.split_type,
          machine_settings: exercise.machine_settings,
          created_at: exercise.created_at
        });
      } catch (err) {
        await this.enqueueSyncItem('exercise', 'insert', exercise);
      }
    } else {
      await this.enqueueSyncItem('exercise', 'insert', exercise);
    }
  }

  // Enqueue pending mutation
  private static async enqueueSyncItem(entity: SyncQueueItem['entity'], action: SyncQueueItem['action'], payload: any) {
    try {
      await db.sync_queue.add({
        id: crypto.randomUUID(),
        action,
        entity,
        payload,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to enqueue sync item:', err);
    }
  }

  // Process offline sync queue
  static async processSyncQueue(): Promise<number> {
    if (this.isSyncing || !isSupabaseConfigured || !supabase || !navigator.onLine) {
      return 0;
    }

    this.isSyncing = true;
    let syncedCount = 0;

    try {
      const pendingItems = await db.sync_queue.orderBy('created_at').toArray();

      for (const item of pendingItems) {
        try {
          if (item.entity === 'workout' && item.action === 'insert') {
            const { workout, sets, userId } = item.payload;
            const { error: wError } = await supabase.from('workouts').upsert({
              id: workout.id,
              user_id: userId,
              title: workout.title,
              split_type: workout.split_type,
              started_at: workout.started_at,
              completed_at: workout.completed_at,
              notes: workout.notes
            });
            if (wError) throw wError;

            if (sets && sets.length > 0) {
              const { error: sError } = await supabase.from('workout_sets').upsert(sets);
              if (sError) throw sError;
            }
          } else if (item.entity === 'exercise') {
            if (item.action === 'update') {
              const { id, machine_settings } = item.payload;
              await supabase.from('exercises').update({ machine_settings }).eq('id', id);
            } else if (item.action === 'insert') {
              await supabase.from('exercises').upsert(item.payload);
            }
          }

          // Successfully pushed, remove from queue
          await db.sync_queue.delete(item.id);
          syncedCount++;
        } catch (itemErr) {
          console.warn('Queue item sync error, stopping queue processing:', itemErr);
          break; // Stop and retry later
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return syncedCount;
  }
}

// Global online event listener to trigger queue flush
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Online connection restored. Processing sync queue...');
    SyncManager.processSyncQueue();
  });
}

