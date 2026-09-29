import React from 'react';
import { ActiveWorkoutSet } from '../../types/gym';
import { useUnit } from '../../context/UnitContext';
import { RapidSteppers } from './RapidSteppers';
import { Check, Trash2 } from 'lucide-react';

interface SetRowProps {
  set: ActiveWorkoutSet;
  canDelete: boolean;
  onUpdate: (updates: Partial<ActiveWorkoutSet>) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  canDelete,
  onUpdate,
  onToggleComplete,
  onDelete
}) => {
  const { unit, formatWeight } = useUnit();

  const handleWeightAdjust = (delta: number) => {
    let currentVal = set.weight !== '' ? Number(set.weight) : (set.prev_weight ? Number(set.prev_weight) : 0);
    currentVal = Math.max(0, currentVal + delta);
    onUpdate({ weight: currentVal % 1 === 0 ? currentVal : Number(currentVal.toFixed(2)) });
  };

  const handleRepsAdjust = (delta: number) => {
    let currentVal = set.reps !== '' ? Number(set.reps) : (set.prev_reps ? Number(set.prev_reps) : 0);
    currentVal = Math.max(1, currentVal + delta);
    onUpdate({ reps: currentVal });
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 space-y-3.5 border transition-all ${
        set.is_completed
          ? 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
          : 'bg-slate-50 border-slate-200/90 shadow-2xs'
      }`}
    >
      {/* Top row: Set badge, Target info, Numeric Inputs, Checkmark button */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Set Indicator & Ghost-text previous performance */}
        <div className="flex flex-col min-w-[85px]">
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-950 w-fit shadow-2xs">
            SET {set.set_number}
          </span>
          {set.prev_weight !== undefined && set.prev_reps !== undefined && (
            <span className="text-xs text-slate-500 mt-1.5 font-medium leading-tight">
              Target: <span className="text-slate-900 font-bold">{formatWeight(set.prev_weight)} {unit} × {set.prev_reps}</span>
            </span>
          )}
        </div>

        {/* Numeric Inputs & Completion Button */}
        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
          {/* Weight Input */}
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={set.weight}
              placeholder={set.prev_weight !== undefined ? formatWeight(set.prev_weight) : '0'}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                onUpdate({ weight: val === '' ? '' : val });
              }}
              className="w-22 min-h-[48px] h-12 text-center font-mono font-black text-sm bg-white border border-slate-300 focus:border-slate-950 rounded-2xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 shadow-2xs transition-all"
            />
            <span className="absolute right-2.5 bottom-1.5 text-[10px] text-slate-400 font-bold uppercase pointer-events-none">
              {unit}
            </span>
          </div>

          {/* Reps Input */}
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={set.reps}
              placeholder={set.prev_reps !== undefined ? String(set.prev_reps) : '0'}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                onUpdate({ reps: val === '' ? '' : val });
              }}
              className="w-18 min-h-[48px] h-12 text-center font-mono font-black text-sm bg-white border border-slate-300 focus:border-slate-950 rounded-2xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 shadow-2xs transition-all"
            />
            <span className="absolute right-2 bottom-1.5 text-[10px] text-slate-400 font-bold pointer-events-none">
              reps
            </span>
          </div>

          {/* Set Completion Button (48x48px touch target with tactile finish) */}
          <button
            type="button"
            onClick={onToggleComplete}
            aria-label="Mark set complete"
            className={`min-h-[48px] min-w-[48px] h-12 w-12 rounded-2xl flex items-center justify-center font-black active:scale-95 transition-all shadow-xs ${
              set.is_completed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-950 hover:bg-slate-800 text-white'
            }`}
          >
            <Check className={`w-5 h-5 ${set.is_completed ? 'stroke-[3]' : 'stroke-2'}`} />
          </button>

          {/* Delete Set */}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete set"
              className="min-h-touch w-8 text-slate-400 hover:text-red-600 active:scale-95 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rapid-Increment Steppers (One-tap chips) */}
      <RapidSteppers
        onAdjustWeight={handleWeightAdjust}
        onAdjustReps={handleRepsAdjust}
      />
    </div>
  );
};
