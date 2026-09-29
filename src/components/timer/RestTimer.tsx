import React from 'react';
import { Plus, Pause, Play, RotateCcw, Volume2, ShieldCheck } from 'lucide-react';

interface RestTimerProps {
  formattedTime: string;
  isRunning: boolean;
  timeLeft: number;
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
  isWakeLockActive = true,
  onAddSeconds,
  onStartTimer,
  onToggleTimer,
  onStopTimer
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Label, Big Countdown, Wake Lock status */}
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-500">Rest Timer</span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-black text-slate-900 tracking-tight mt-1">
            {formattedTime}
          </div>

          <div className="flex items-center gap-2.5 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Wake Lock {isWakeLockActive ? 'Active' : 'Idle'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              Audio Chimes On
            </span>
          </div>
        </div>

        {/* Right Side: Normal dark button with rounded corners & preset buttons */}
        <div className="flex flex-col sm:items-end gap-2.5">
          <button
            onClick={() => onAddSeconds(30)}
            className="min-h-touch h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            +30s Rest
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onStartTimer(60)}
              className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 active:scale-95 transition-colors"
            >
              60s
            </button>
            <button
              onClick={() => onStartTimer(90)}
              className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 active:scale-95 transition-colors"
            >
              90s
            </button>
            <button
              onClick={onToggleTimer}
              className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-900 border border-slate-200 active:scale-95 flex items-center gap-1.5 transition-colors"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            {timeLeft > 0 && (
              <button
                onClick={onStopTimer}
                title="Reset timer"
                className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 border border-slate-200 active:scale-95 flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
