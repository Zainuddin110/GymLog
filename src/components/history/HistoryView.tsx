import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Workout, WorkoutSet, Exercise } from '../../types/gym';
import { useUnit } from '../../context/UnitContext';
import { Calendar, Dumbbell, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { unit, formatWeight } = useUnit();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [workoutSetsMap, setWorkoutSetsMap] = useState<Record<string, WorkoutSet[]>>({});
  const [exercisesMap, setExercisesMap] = useState<Record<string, Exercise>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setIsLoading(true);
    try {
      const allWorkouts = await db.workouts.reverse().sortBy('started_at');
      const allSets = await db.workout_sets.toArray();
      const allExercises = await db.exercises.toArray();

      const setsMap: Record<string, WorkoutSet[]> = {};
      allSets.forEach(s => {
        if (!setsMap[s.workout_id]) setsMap[s.workout_id] = [];
        setsMap[s.workout_id].push(s);
      });

      const exMap: Record<string, Exercise> = {};
      allExercises.forEach(e => {
        exMap[e.id] = e;
      });

      setWorkouts(allWorkouts);
      setWorkoutSetsMap(setsMap);
      setExercisesMap(exMap);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId(prev => (prev === id ? null : id));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this workout from local device history?')) {
      await db.workouts.delete(id);
      await db.workout_sets.where('workout_id').equals(id).delete();
      loadHistory();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Infinite Lifetime Archive</h2>
          <p className="text-xs text-slate-500 mt-1">
            Stored permanently in local device IndexedDB (Dexie.js)
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-900 shadow-xs">
          {workouts.length} {workouts.length === 1 ? 'Workout' : 'Workouts'}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading history...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
          <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No workouts logged yet</p>
          <p className="text-xs text-slate-400 mt-1.5">
            Complete your first session from the Quickstart or Workout tab to begin your archive!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map(w => {
            const sets = workoutSetsMap[w.id] || [];
            const isExpanded = expandedWorkoutId === w.id;

            // Group sets by exercise
            const groupedByEx: Record<string, WorkoutSet[]> = {};
            sets.forEach(s => {
              if (!groupedByEx[s.exercise_id]) groupedByEx[s.exercise_id] = [];
              groupedByEx[s.exercise_id].push(s);
            });

            return (
              <div
                key={w.id}
                onClick={() => toggleExpand(w.id)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all shadow-sm cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                        {w.split_type}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(w.started_at)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">{w.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                      <span>{Object.keys(groupedByEx).length} Exercises</span>
                      <span>•</span>
                      <span>{sets.length} Sets Total</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleDelete(w.id, e)}
                      aria-label="Delete workout"
                      className="min-h-touch w-9 h-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-4 cursor-default">
                    {w.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                        &quot;{w.notes}&quot;
                      </p>
                    )}

                    <div className="space-y-3">
                      {Object.entries(groupedByEx).map(([exId, exSets]) => {
                        const ex = exercisesMap[exId];
                        return (
                          <div key={exId} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                            <h4 className="text-xs font-bold text-slate-900 mb-2">
                              {ex?.name || 'Exercise'}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {exSets.map(s => (
                                <div
                                  key={s.id}
                                  className="text-xs bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs"
                                >
                                  <span className="text-slate-500 font-medium">Set {s.set_number}:</span>
                                  <span className="font-mono font-bold text-slate-900">
                                    {formatWeight(s.weight)} {unit} × {s.reps}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
