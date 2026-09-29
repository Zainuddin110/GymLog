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
    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-1 overflow-x-auto select-none">
      <span className="text-[11px] font-black text-slate-400 shrink-0 uppercase tracking-wider pl-0.5">
        Rapid Pills:
      </span>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Weight increment chips */}
        {weightSteps.map(step => (
          <button
            key={step}
            type="button"
            onClick={() => onAdjustWeight(step)}
            className="min-h-touch px-3 rounded-xl bg-white hover:bg-slate-950 hover:text-white border border-slate-200/90 active:scale-95 text-xs font-black text-slate-800 transition-all flex items-center justify-center shadow-2xs"
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
          className="min-h-touch min-w-[42px] px-2.5 rounded-xl bg-white hover:bg-slate-950 hover:text-white border border-slate-200/90 active:scale-95 text-xs font-black text-slate-800 transition-all flex items-center justify-center shadow-2xs"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="ml-1 text-xs">1</span>
        </button>

        <button
          type="button"
          onClick={() => onAdjustReps(1)}
          aria-label="Increase reps"
          className="min-h-touch min-w-[42px] px-2.5 rounded-xl bg-white hover:bg-slate-950 hover:text-white border border-slate-200/90 active:scale-95 text-xs font-black text-slate-800 transition-all flex items-center justify-center shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="ml-1 text-xs">1</span>
        </button>
      </div>
    </div>
  );
};
