import React from 'react';
import { useUnit } from '../../context/UnitContext';
import { Plus, Minus } from 'lucide-react';

interface RapidSteppersProps {
  onAdjustWeight: (delta: number) => void;
  onAdjustReps: (delta: number) => void;
}

export const RapidSteppers: React.FC<RapidSteppersProps> = ({
  onAdjustWeight,
  onAdjustReps
}) => {
  const { weightSteps } = useUnit();

  return (
    <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-1 overflow-x-auto select-none">
      <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider pl-0.5">
        Pills:
      </span>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Weight increment chips: Clean rounded flat buttons */}
        {weightSteps.map(step => (
          <button
            key={step}
            type="button"
            onClick={() => onAdjustWeight(step)}
            className="min-h-touch px-3 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200/80 active:scale-95 text-xs font-bold text-slate-800 transition-all flex items-center justify-center shadow-xs"
          >
            +{step}
          </button>
        ))}

        {/* Vertical divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Reps decrements / increments */}
        <button
          type="button"
          onClick={() => onAdjustReps(-1)}
          aria-label="Decrease reps"
          className="min-h-touch min-w-[40px] px-2.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200/80 active:scale-95 text-xs font-bold text-slate-800 transition-all flex items-center justify-center shadow-xs"
        >
          <Minus className="w-3.5 h-3.5" />
          <span className="ml-1 text-xs">1</span>
        </button>

        <button
          type="button"
          onClick={() => onAdjustReps(1)}
          aria-label="Increase reps"
          className="min-h-touch min-w-[40px] px-2.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200/80 active:scale-95 text-xs font-bold text-slate-800 transition-all flex items-center justify-center shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="ml-1 text-xs">1</span>
        </button>
      </div>
    </div>
  );
};
