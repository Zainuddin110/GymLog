import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../lib/db';
import { SyncManager } from '../lib/syncManager';
import { playSetCompleteSound, triggerHaptic } from '../lib/audioCues';
import {
  ActiveExerciseSession,
  ActiveWorkoutDraft,
  ActiveWorkoutSet,
  Exercise,
  SplitType,
  Workout,
  WorkoutSet
} from '../types/gym';

const DRAFT_STORAGE_KEY = 'gymlog_active_workout_draft_v1';

export function useActiveWorkout(userId: string) {
  const [isActive, setIsActive] = useState(false);
  const [workoutId, setWorkoutId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [splitType, setSplitType] = useState<SplitType>('Push');
  const [startedAt, setStartedAt] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState<string>('');
  const [exercises, setExercises] = useState<ActiveExerciseSession[]>([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ title: string; split: SplitType; startedAt: string } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ActiveWorkoutDraft;
        if (parsed && parsed.exercises) {
          setHasDraft(true);
          setDraftInfo({
            title: parsed.title,
            split: parsed.split_type,
            startedAt: parsed.started_at
          });
        }
      }
    } catch (e) {
      console.warn('Error reading saved workout draft:', e);
    }
  }, []);

  // Elapsed timer ticker
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Zero-Data-Loss continuous auto-save
  useEffect(() => {
    if (!isActive) return;

    const draft: ActiveWorkoutDraft = {
      title,
      split_type: splitType,
      started_at: startedAt,
      exercises,
      elapsed_seconds: elapsedSeconds
    };

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    // Also save to Dexie drafts for double resilience
    db.drafts.put({
      key: 'active_workout',
      data: draft,
      updated_at: new Date().toISOString()
    }).catch(() => {});
  }, [isActive, title, splitType, startedAt, exercises, elapsedSeconds]);

  // Resume saved draft
  const resumeDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return false;
      const draft = JSON.parse(saved) as ActiveWorkoutDraft;

      setWorkoutId(crypto.randomUUID());
      setTitle(draft.title || `${draft.split_type} Session`);
      setSplitType(draft.split_type);
      setStartedAt(draft.started_at);
      setElapsedSeconds(draft.elapsed_seconds || 0);
      setExercises(draft.exercises || []);
      setIsActive(true);
      setHasDraft(false);
      return true;
    } catch (err) {
      console.error('Failed to resume draft:', err);
      return false;
    }
  }, []);

  // Discard draft
  const discardDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    db.drafts.delete('active_workout').catch(() => {});
    setHasDraft(false);
    setDraftInfo(null);
  }, []);

  // Start new workout (Optionally clone from previous session)
  const startWorkout = useCallback(async (split: SplitType, customTitle?: string, clonePrevious = false) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const workoutTitle = customTitle || `${split} Session`;

    let initialExercises: ActiveExerciseSession[] = [];

    if (clonePrevious) {
      // Find the most recent workout for this split
      const recentWorkout = await db.workouts
        .where('split_type')
        .equals(split)
        .reverse()
        .sortBy('started_at');

      if (recentWorkout.length > 0) {
        const lastWorkout = recentWorkout[0];
        const sets = await db.workout_sets
          .where('workout_id')
          .equals(lastWorkout.id)
          .toArray();

        // Group sets by exercise
        const exerciseIds = Array.from(new Set(sets.map(s => s.exercise_id)));
        const loadedExercises = await db.exercises
          .where('id')
          .anyOf(exerciseIds)
          .toArray();

        const exerciseMap = new Map(loadedExercises.map(e => [e.id, e]));

        // Construct cloned exercises with ghost-text placeholders
        for (const exId of exerciseIds) {
          const ex = exerciseMap.get(exId);
          if (!ex) continue;

          const exSets = sets
            .filter(s => s.exercise_id === exId)
            .sort((a, b) => a.set_number - b.set_number);

          initialExercises.push({
            exercise: ex,
            sets: exSets.map((s, idx) => ({
              id: crypto.randomUUID(),
              set_number: idx + 1,
              weight: '', // Empty input so ghost text appears!
              reps: '',
              is_completed: false,
              prev_weight: s.weight,
              prev_reps: s.reps
            }))
          });
        }
      }
    }

    // If no clone or no previous exercises found, pick default exercises for this split
    if (initialExercises.length === 0) {
      const defaultForSplit = await db.exercises
        .where('split_type')
        .equals(split)
        .limit(3)
        .toArray();

      initialExercises = defaultForSplit.map(ex => ({
        exercise: ex,
        sets: [
          {
            id: crypto.randomUUID(),
            set_number: 1,
            weight: '',
            reps: '',
            is_completed: false
          },
          {
            id: crypto.randomUUID(),
            set_number: 2,
            weight: '',
            reps: '',
            is_completed: false
          },
          {
            id: crypto.randomUUID(),
            set_number: 3,
            weight: '',
            reps: '',
            is_completed: false
          }
        ]
      }));
    }

    setWorkoutId(id);
    setTitle(workoutTitle);
    setSplitType(split);
    setStartedAt(now);
    setElapsedSeconds(0);
    setNotes('');
    setExercises(initialExercises);
    setIsActive(true);
    setHasDraft(false);
  }, []);

  const addExercise = useCallback((exercise: Exercise) => {
    setExercises(prev => [
      ...prev,
      {
        exercise,
        sets: [
          {
            id: crypto.randomUUID(),
            set_number: 1,
            weight: '',
            reps: '',
            is_completed: false
          }
        ]
      }
    ]);
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  const updateExerciseNotes = useCallback((exerciseIndex: number, newNotes: string) => {
    setExercises(prev => {
      const copy = [...prev];
      if (copy[exerciseIndex]) {
        copy[exerciseIndex] = {
          ...copy[exerciseIndex],
          exercise: {
            ...copy[exerciseIndex].exercise,
            machine_settings: newNotes
          }
        };
        // Auto-save to Dexie & Supabase
        SyncManager.updateExerciseSettings(copy[exerciseIndex].exercise.id, newNotes, userId);
      }
      return copy;
    });
  }, [userId]);

  const addSet = useCallback((exerciseIndex: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const target = copy[exerciseIndex];
      if (!target) return prev;

      const lastSet = target.sets[target.sets.length - 1];
      const nextNumber = target.sets.length + 1;

      const newSet: ActiveWorkoutSet = {
        id: crypto.randomUUID(),
        set_number: nextNumber,
        weight: lastSet ? lastSet.weight : '',
        reps: lastSet ? lastSet.reps : '',
        is_completed: false,
        prev_weight: lastSet?.prev_weight,
        prev_reps: lastSet?.prev_reps
      };

      copy[exerciseIndex] = {
        ...target,
        sets: [...target.sets, newSet]
      };
      return copy;
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const target = copy[exerciseIndex];
      if (!target) return prev;

      const filtered = target.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, set_number: idx + 1 }));

      copy[exerciseIndex] = { ...target, sets: filtered };
      return copy;
    });
  }, []);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<ActiveWorkoutSet>) => {
    setExercises(prev => {
      const copy = [...prev];
      const target = copy[exerciseIndex];
      if (!target || !target.sets[setIndex]) return prev;

      const updatedSets = [...target.sets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };

      copy[exerciseIndex] = { ...target, sets: updatedSets };
      return copy;
    });
  }, []);

  const toggleSetComplete = useCallback((exerciseIndex: number, setIndex: number): boolean => {
    let willBeCompleted = false;

    setExercises(prev => {
      const copy = [...prev];
      const target = copy[exerciseIndex];
      if (!target || !target.sets[setIndex]) return prev;

      const current = target.sets[setIndex];
      willBeCompleted = !current.is_completed;

      // If weight is empty and there's a ghost prev_weight, autofill it
      const finalWeight = current.weight === '' && current.prev_weight !== undefined
        ? current.prev_weight
        : current.weight;
      const finalReps = current.reps === '' && current.prev_reps !== undefined
        ? current.prev_reps
        : current.reps;

      const updatedSets = [...target.sets];
      updatedSets[setIndex] = {
        ...current,
        weight: finalWeight,
        reps: finalReps,
        is_completed: willBeCompleted
      };

      copy[exerciseIndex] = { ...target, sets: updatedSets };
      return copy;
    });

    if (willBeCompleted) {
      playSetCompleteSound();
      triggerHaptic([60, 40, 100]);
    }

    return willBeCompleted;
  }, []);

  // Complete session & trigger dual-write
  const finishWorkout = useCallback(async (): Promise<boolean> => {
    if (!isActive) return false;

    const completedAt = new Date().toISOString();
    const workoutRecord: Workout = {
      id: workoutId,
      user_id: userId,
      title,
      split_type: splitType,
      started_at: startedAt,
      completed_at: completedAt,
      notes
    };

    const setsPayload: WorkoutSet[] = [];
    exercises.forEach(exGroup => {
      exGroup.sets.forEach(s => {
        // Only include if weight or reps entered, or marked complete
        const w = Number(s.weight) || (s.prev_weight ? Number(s.prev_weight) : 0);
        const r = Number(s.reps) || (s.prev_reps ? Number(s.prev_reps) : 0);

        setsPayload.push({
          id: s.id,
          workout_id: workoutId,
          exercise_id: exGroup.exercise.id,
          set_number: s.set_number,
          weight: w,
          reps: r,
          is_completed: s.is_completed,
          created_at: completedAt
        });
      });
    });

    // Execute dual-write (Dexie lifetime + Supabase 3-cap sync)
    await SyncManager.saveWorkoutDualWrite(workoutRecord, setsPayload, userId);

    // Clean up draft
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    db.drafts.delete('active_workout').catch(() => {});

    setIsActive(false);
    setExercises([]);
    setElapsedSeconds(0);
    return true;
  }, [isActive, workoutId, userId, title, splitType, startedAt, notes, exercises]);

  const cancelWorkout = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    db.drafts.delete('active_workout').catch(() => {});
    setIsActive(false);
    setExercises([]);
    setElapsedSeconds(0);
  }, []);

  return {
    isActive,
    workoutId,
    title,
    splitType,
    startedAt,
    elapsedSeconds,
    notes,
    exercises,
    hasDraft,
    draftInfo,
    startWorkout,
    resumeDraft,
    discardDraft,
    addExercise,
    removeExercise,
    updateExerciseNotes,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    finishWorkout,
    cancelWorkout,
    setNotes
  };
}

