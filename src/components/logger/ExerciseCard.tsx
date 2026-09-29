import React from 'react';
import { ActiveExerciseSession, ActiveWorkoutSet } from '../../types/gym';
import { EquipmentNotes } from './EquipmentNotes';
import { SetRow } from './SetRow';
import { Plus, Trash2 } from 'lucide-react';

interface ExerciseCardProps {
  exerciseSession: ActiveExerciseSession;
  exerciseIndex: number;
  onUpdateNotes: (notes: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, updates: Partial<ActiveWorkoutSet>) => void;
  onToggleSetComplete: (setIndex: number) => void;
  onRemoveExercise: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseSession,
  onUpdateNotes,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSetComplete,
  onRemoveExercise
}) => {
  const { exercise, sets } = exerciseSession;

  const splitColors: Record<string, string> = {
    Push: 'bg-amber-50 text-amber-800 border-amber-200/80',
    Pull: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    Legs: 'bg-blue-50 text-blue-800 border-blue-200/80',
    Arms: 'bg-purple-50 text-purple-800 border-purple-200/80',
    Core: 'bg-rose-50 text-rose-800 border-rose-200/80'
  };

  const badgeColor = splitColors[exercise.split_type] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <section className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 transition-all">
      {/* Exercise Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
              {exercise.name}
            </h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}`}>
              {exercise.split_type}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Primary Target Exercise</p>
        </div>

        <button
          type="button"
          onClick={onRemoveExercise}
          aria-label="Remove exercise from workout"
          className="min-h-touch h-10 w-10 rounded-2xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Equipment Micro-Notes (Auto-saving on blur) */}
      <EquipmentNotes
        initialNotes={exercise.machine_settings}
        onSave={onUpdateNotes}
      />

      {/* Sets List */}
      <div className="space-y-3.5 pt-1">
        {sets.map((set, setIdx) => (
          <SetRow
            key={set.id}
            set={set}
            canDelete={sets.length > 1}
            onUpdate={updates => onUpdateSet(setIdx, updates)}
            onToggleComplete={() => onToggleSetComplete(setIdx)}
            onDelete={() => onRemoveSet(setIdx)}
          />
        ))}
      </div>

      {/* Add Set Button */}
      <button
        type="button"
        onClick={onAddSet}
        className="w-full min-h-touch py-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-slate-950 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-2xs"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Set to {exercise.name}</span>
      </button>
    </section>
  );
};
