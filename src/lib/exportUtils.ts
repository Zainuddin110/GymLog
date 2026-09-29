import { db } from './db';

export async function exportLifetimeDataAsCSV(): Promise<void> {
  const workouts = await db.workouts.toArray();
  const sets = await db.workout_sets.toArray();
  const exercises = await db.exercises.toArray();

  const exerciseMap = new Map(exercises.map(e => [e.id, e]));
  const workoutMap = new Map(workouts.map(w => [w.id, w]));

  const headers = [
    'Workout Date',
    'Workout Title',
    'Split Type',
    'Exercise Name',
    'Set Number',
    'Weight (kg)',
    'Reps',
    'Completed',
    'Equipment Notes'
  ];

  const rows: string[] = [headers.join(',')];

  // Sort sets chronologically by workout
  const sortedSets = sets.sort((a, b) => {
    const wA = workoutMap.get(a.workout_id);
    const wB = workoutMap.get(b.workout_id);
    const dateA = wA?.started_at || '';
    const dateB = wB?.started_at || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return a.set_number - b.set_number;
  });

  sortedSets.forEach(s => {
    const workout = workoutMap.get(s.workout_id);
    const exercise = exerciseMap.get(s.exercise_id);

    const date = workout?.started_at ? new Date(workout.started_at).toISOString().split('T')[0] : '';
    const title = workout?.title ? `"${workout.title.replace(/"/g, '""')}"` : 'Workout';
    const split = workout?.split_type || '';
    const exName = exercise?.name ? `"${exercise.name.replace(/"/g, '""')}"` : 'Exercise';
    const notes = exercise?.machine_settings ? `"${exercise.machine_settings.replace(/"/g, '""')}"` : '';

    rows.push([
      date,
      title,
      split,
      exName,
      s.set_number,
      s.weight,
      s.reps,
      s.is_completed ? 'YES' : 'NO',
      notes
    ].join(','));
  });

  const csvContent = rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `gymlog_archive_${new Date().toISOString().split('T')[0]}.csv`);
}

export async function exportLifetimeDataAsJSON(): Promise<void> {
  const workouts = await db.workouts.toArray();
  const sets = await db.workout_sets.toArray();
  const exercises = await db.exercises.toArray();

  const exportPayload = {
    exported_at: new Date().toISOString(),
    version: '1.0.0',
    total_workouts: workouts.length,
    total_sets: sets.length,
    exercises,
    workouts: workouts.map(w => ({
      ...w,
      sets: sets.filter(s => s.workout_id === w.id)
    }))
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  triggerDownload(blob, `gymlog_backup_${new Date().toISOString().split('T')[0]}.json`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

