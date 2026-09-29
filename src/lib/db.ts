import Dexie, { type EntityTable } from 'dexie';
import { Exercise, Workout, WorkoutSet, SyncQueueItem } from '../types/gym';

export interface DraftRecord {
  key: string;
  data: any;
  updated_at: string;
}

export class GymLogDatabase extends Dexie {
  workouts!: EntityTable<Workout, 'id'>;
  workout_sets!: EntityTable<WorkoutSet, 'id'>;
  exercises!: EntityTable<Exercise, 'id'>;
  sync_queue!: EntityTable<SyncQueueItem, 'id'>;
  drafts!: EntityTable<DraftRecord, 'key'>;

  constructor() {
    super('GymLogDB');
    this.version(1).stores({
      workouts: 'id, user_id, split_type, started_at, completed_at',
      workout_sets: 'id, workout_id, exercise_id, set_number',
      exercises: 'id, user_id, split_type, name',
      sync_queue: 'id, action, entity, created_at',
      drafts: 'key, updated_at'
    });
  }
}

export const db = new GymLogDatabase();

// Default starter exercise library
export const DEFAULT_EXERCISES: Omit<Exercise, 'created_at'>[] = [
  // Push
  { id: 'ex-bench-press', user_id: null, name: 'Barbell Bench Press', split_type: 'Push', machine_settings: 'Flat bench, grip 1.5x shoulder width' },
  { id: 'ex-incline-db', user_id: null, name: 'Incline Dumbbell Press', split_type: 'Push', machine_settings: 'Bench notch #3 (30 deg)' },
  { id: 'ex-ohp', user_id: null, name: 'Standing Overhead Press', split_type: 'Push', machine_settings: 'Barbell from collar bone' },
  { id: 'ex-lateral-raise', user_id: null, name: 'Dumbbell Lateral Raise', split_type: 'Push', machine_settings: 'Slight forward lean' },
  { id: 'ex-tricep-pushdown', user_id: null, name: 'Cable Triceps Pushdown', split_type: 'Push', machine_settings: 'Rope attachment, top pulley' },
  { id: 'ex-dips', user_id: null, name: 'Dips (Chest Focus)', split_type: 'Push', machine_settings: 'Forward lean 30 deg' },

  // Pull
  { id: 'ex-deadlift', user_id: null, name: 'Conventional Deadlift', split_type: 'Pull', machine_settings: 'Shins 1 inch from bar' },
  { id: 'ex-barbell-row', user_id: null, name: 'Barbell Bent-Over Row', split_type: 'Pull', machine_settings: 'Overhand grip, 45 deg torso' },
  { id: 'ex-lat-pulldown', user_id: null, name: 'Lat Pulldown', split_type: 'Pull', machine_settings: 'Wide grip bar, thigh pad tight' },
  { id: 'ex-cable-row', user_id: null, name: 'Seated Cable Row', split_type: 'Pull', machine_settings: 'Close grip V-handle, chest up' },
  { id: 'ex-bicep-curl', user_id: null, name: 'Barbell Bicep Curl', split_type: 'Pull', machine_settings: 'Shoulder width underhand' },
  { id: 'ex-face-pull', user_id: null, name: 'Face Pulls', split_type: 'Pull', machine_settings: 'Rope at eye level' },

  // Legs
  { id: 'ex-squat', user_id: null, name: 'Barbell Back Squat', split_type: 'Legs', machine_settings: 'Safety bars at notch 7, belt on set 3+' },
  { id: 'ex-rdl', user_id: null, name: 'Romanian Deadlift', split_type: 'Legs', machine_settings: 'Slight knee bend, hinge at hips' },
  { id: 'ex-leg-press', user_id: null, name: 'Leg Press', split_type: 'Legs', machine_settings: 'Sled pin #5, feet shoulder width' },
  { id: 'ex-calf-raise', user_id: null, name: 'Standing Calf Raise', split_type: 'Legs', machine_settings: 'Full stretch at bottom' },
  { id: 'ex-leg-curl', user_id: null, name: 'Lying Hamstring Curl', split_type: 'Legs', machine_settings: 'Pad on lower calf, ankle flexed' },
  { id: 'ex-split-squat', user_id: null, name: 'Bulgarian Split Squat', split_type: 'Legs', machine_settings: 'Rear foot on bench' },

  // Arms
  { id: 'ex-incline-curl', user_id: null, name: 'Incline Dumbbell Curl', split_type: 'Arms', machine_settings: 'Bench at notch 4' },
  { id: 'ex-skull-crusher', user_id: null, name: 'Skull Crushers', split_type: 'Arms', machine_settings: 'EZ-bar to forehead' },
  { id: 'ex-hammer-curl', user_id: null, name: 'Hammer Curls', split_type: 'Arms', machine_settings: 'Neutral grip dumbbells' },
  { id: 'ex-overhead-tricep', user_id: null, name: 'Overhead Cable Tricep Extension', split_type: 'Arms', machine_settings: 'Rope at shoulder height' },

  // Core
  { id: 'ex-hanging-leg-raise', user_id: null, name: 'Hanging Leg Raise', split_type: 'Core', machine_settings: 'Dead hang, curl pelvis up' },
  { id: 'ex-ab-wheel', user_id: null, name: 'Ab Roller Wheel', split_type: 'Core', machine_settings: 'Knees on mat, slow rollout' }
];

export async function initLocalDatabase() {
  try {
    const count = await db.exercises.count();
    if (count === 0) {
      const now = new Date().toISOString();
      await db.exercises.bulkAdd(
        DEFAULT_EXERCISES.map(e => ({ ...e, created_at: now }))
      );
    }
  } catch (err) {
    console.error('Error initializing Dexie DB:', err);
  }
}

