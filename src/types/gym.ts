export type SplitType = 'Push' | 'Pull' | 'Legs' | 'Arms' | 'Core' | 'Full Body' | 'Other';

export type UnitPreference = 'kg' | 'lbs';

export interface Profile {
  id: string;
  full_name: string;
  unit_preference: UnitPreference;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string | null; // null = system default, string = custom
  name: string;
  split_type: SplitType;
  machine_settings: string; // Micro-notes: e.g. "Seat pin #4, handle notch 2"
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  title: string;
  split_type: SplitType;
  started_at: string;
  completed_at: string | null;
  notes?: string | null;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  is_completed: boolean;
  created_at: string;
}

export interface ActiveWorkoutSet {
  id: string;
  set_number: number;
  weight: number | string;
  reps: number | string;
  is_completed: boolean;
  prev_weight?: number;
  prev_reps?: number;
}

export interface ActiveExerciseSession {
  exercise: Exercise;
  sets: ActiveWorkoutSet[];
}

export interface ActiveWorkoutDraft {
  title: string;
  split_type: SplitType;
  started_at: string;
  exercises: ActiveExerciseSession[];
  elapsed_seconds: number;
}

export interface SyncQueueItem {
  id: string;
  action: 'insert' | 'update' | 'delete';
  entity: 'workout' | 'workout_set' | 'exercise' | 'profile';
  payload: any;
  created_at: string;
}

export interface LifetimeStats {
  totalWorkouts: number;
  weeklyStreak: number;
  totalVolumeKg: number;
  totalVolumeLbs: number;
  favoriteSplit: SplitType | null;
}
