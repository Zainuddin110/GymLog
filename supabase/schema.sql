-- ==============================================================================
-- GymLog PWA: Offline-First Workout Tracker
-- PostgreSQL Schema, Zero-Cost Pruning Triggers & Row Level Security (RLS)
-- ==============================================================================

-- 1. Profiles Table (Holds identity, display preferences, and unit selection)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Gym Member',
  unit_preference TEXT NOT NULL DEFAULT 'kg' CHECK (unit_preference IN ('kg', 'lbs')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Exercises Table (Shared global library + member-created custom exercises)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = System Default, UUID = Custom
  name TEXT NOT NULL,
  split_type TEXT NOT NULL, -- e.g. 'Push', 'Pull', 'Legs', 'Arms', 'Core'
  machine_settings TEXT DEFAULT '', -- Micro-notes: "Seat pin #4, handle notch 2"
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Workouts Table (Scoped to split_type for precise auto-pruning)
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  split_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- 4. Workout Sets Table (Cascades deletion automatically when workout is pruned)
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE RESTRICT NOT NULL,
  set_number INT NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  reps INT NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 3.1 Zero-Cost Cloud Pruning Engine (Automated Trigger)
-- Deletes workouts exceeding 3 most recent sessions for that user & split_type
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.prune_excess_workouts() 
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.workouts
  WHERE id IN (
    SELECT id FROM public.workouts
    WHERE user_id = NEW.user_id AND split_type = NEW.split_type
    ORDER BY started_at DESC
    OFFSET 3
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prune_excess_workouts ON public.workouts;
CREATE TRIGGER trigger_prune_excess_workouts
AFTER INSERT ON public.workouts
FOR EACH ROW EXECUTE FUNCTION public.prune_excess_workouts();

-- ==============================================================================
-- 3.2 Automated Profile Creation on User Signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, unit_preference)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Gym Member'),
    COALESCE(NEW.raw_user_meta_data->>'unit_preference', 'kg')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    unit_preference = EXCLUDED.unit_preference;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users manage their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Exercises: System default exercises (user_id IS NULL) are readable by all;
-- Custom exercises readable & manageable only by owner
CREATE POLICY "Exercises readable by owner or system" ON public.exercises
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert custom exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises" ON public.exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Workouts: Scoped to owner
CREATE POLICY "Workouts managed by owner" ON public.workouts
  FOR ALL USING (auth.uid() = user_id);

-- Workout Sets: Scoped to owner via workout relationship
CREATE POLICY "Workout sets managed by workout owner" ON public.workout_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- Default Exercise Library Seed Data (Shared System Defaults: user_id = NULL)
-- ==============================================================================
INSERT INTO public.exercises (id, user_id, name, split_type, machine_settings) VALUES
  -- Push
  (gen_random_uuid(), NULL, 'Barbell Bench Press', 'Push', 'Flat bench, grip 1.5x shoulder width'),
  (gen_random_uuid(), NULL, 'Incline Dumbbell Press', 'Push', 'Bench at notch 3 (30 deg)'),
  (gen_random_uuid(), NULL, 'Standing Overhead Press', 'Push', 'Barbell from collar bone'),
  (gen_random_uuid(), NULL, 'Dumbbell Lateral Raise', 'Push', 'Slight forward lean'),
  (gen_random_uuid(), NULL, 'Cable Triceps Pushdown', 'Push', 'Rope attachment, top pulley'),
  (gen_random_uuid(), NULL, 'Dips (Chest Focus)', 'Push', 'Forward lean 30 deg'),

  -- Pull
  (gen_random_uuid(), NULL, 'Conventional Deadlift', 'Pull', 'Shins 1 inch from bar'),
  (gen_random_uuid(), NULL, 'Barbell Bent-Over Row', 'Pull', 'Overhand grip, 45 deg torso'),
  (gen_random_uuid(), NULL, 'Lat Pulldown', 'Pull', 'Wide grip bar, thigh pad tight'),
  (gen_random_uuid(), NULL, 'Seated Cable Row', 'Pull', 'Close grip V-handle, chest up'),
  (gen_random_uuid(), NULL, 'Barbell Bicep Curl', 'Pull', 'Shoulder width underhand'),
  (gen_random_uuid(), NULL, 'Face Pulls', 'Pull', 'Rope attachment at eye level'),

  -- Legs
  (gen_random_uuid(), NULL, 'Barbell Back Squat', 'Legs', 'Safety bars at notch 7, belt on set 3+'),
  (gen_random_uuid(), NULL, 'Romanian Deadlift', 'Legs', 'Slight knee bend, hinge at hips'),
  (gen_random_uuid(), NULL, 'Leg Press', 'Legs', 'Sled pin #5, feet shoulder width'),
  (gen_random_uuid(), NULL, 'Standing Calf Raise', 'Legs', 'Full stretch at bottom'),
  (gen_random_uuid(), NULL, 'Lying Hamstring Curl', 'Legs', 'Pad on lower calf, ankle flexed'),
  (gen_random_uuid(), NULL, 'Bulgarian Split Squat', 'Legs', 'Rear foot on bench'),

  -- Arms
  (gen_random_uuid(), NULL, 'Incline Dumbbell Curl', 'Arms', 'Bench at notch 4'),
  (gen_random_uuid(), NULL, 'Skull Crushers', 'Arms', 'EZ-bar to forehead'),
  (gen_random_uuid(), NULL, 'Hammer Curls', 'Arms', 'Neutral grip dumbbells'),
  (gen_random_uuid(), NULL, 'Overhead Cable Tricep Extension', 'Arms', 'Rope at shoulder height'),

  -- Core
  (gen_random_uuid(), NULL, 'Hanging Leg Raise', 'Core', 'Dead hang, curl pelvis up'),
  (gen_random_uuid(), NULL, 'Ab Roller Wheel', 'Core', 'Knees on mat, slow rollout'),
  (gen_random_uuid(), NULL, 'Cable Woodchopper', 'Core', 'High-to-low diagonal pull')
ON CONFLICT DO NOTHING;

