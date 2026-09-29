import React from 'react';
import { Plus, Pause, Play, RotateCcw, Volume2, ShieldCheck, Timer } from 'lucide-react';

interface RestTimerProps {
  formattedTime: string;
  isRunning: boolean;
  timeLeft: number;
  initialDuration?: number;
  isWakeLockActive?: boolean;
  onAddSeconds: (secs: number) => void;
  onStartTimer: (secs: number) => void;
  onToggleTimer: () => void;
  onStopTimer: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  formattedTime,
  isRunning,
  timeLeft,
  initialDuration = 90,
  isWakeLockActive = true,
  onAddSeconds,
  onStartTimer,
  onToggleTimer,
  onStopTimer
}) => {
  const progressPercent = initialDuration > 0 ? Math.min(100, (timeLeft / initialDuration) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 relative overflow-hidden transition-all">
      {/* Dynamic Progress indicator line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
        <div
          className="h-full bg-slate-950 transition-all duration-1000 ease-linear rounded-r-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
        {/* Left Side: Countdown & Status Badges */}
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-slate-950 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Timer className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-slate-400">Rest Interval</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Screen Awake
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-mono font-black text-slate-950 tracking-tight mt-0.5">
              {formattedTime}
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Wake Lock {isWakeLockActive ? 'Active' : 'Idle'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                Chimes Ready
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Tactile Quick Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onAddSeconds(30)}
            className="min-h-touch h-11 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            +30s Rest
          </button>

          <button
            onClick={() => onStartTimer(60)}
            className="h-11 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200/60 active:scale-95 transition-colors"
          >
            60s
          </button>
          <button
            onClick={() => onStartTimer(90)}
            className="h-11 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200/60 active:scale-95 transition-colors"
          >
            90s
          </button>
          <button
            onClick={onToggleTimer}
            className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-950 border border-slate-200/60 active:scale-95 flex items-center gap-1.5 transition-colors"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          {timeLeft > 0 && (
            <button
              onClick={onStopTimer}
              title="Reset timer"
              className="h-11 w-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200/60 active:scale-95 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
