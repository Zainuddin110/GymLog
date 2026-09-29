import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { SplitType, Workout } from '../../types/gym';
import { Play, Copy, Calendar, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface SplitQuickstartProps {
  onStartWorkout: (split: SplitType, title?: string, clone?: boolean) => void;
  hasDraft: boolean;
  draftInfo: { title: string; split: SplitType; startedAt: string } | null;
  onResumeDraft: () => void;
  onDiscardDraft: () => void;
}

export const SplitQuickstart: React.FC<SplitQuickstartProps> = ({
  onStartWorkout,
  hasDraft,
  draftInfo,
  onResumeDraft,
  onDiscardDraft
}) => {
  const [splitHistory, setSplitHistory] = useState<Record<SplitType, Workout | null>>({
    Push: null,
    Pull: null,
    Legs: null,
    Arms: null,
    Core: null,
    'Full Body': null,
    Other: null
  });

  useEffect(() => {
    async function loadRecentSplits() {
      const splits: SplitType[] = ['Push', 'Pull', 'Legs', 'Arms', 'Core', 'Full Body'];
      const historyMap: Record<SplitType, Workout | null> = { ...splitHistory };

      for (const sp of splits) {
        const recent = await db.workouts
          .where('split_type')
          .equals(sp)
          .reverse()
          .sortBy('started_at');
        if (recent.length > 0) {
          historyMap[sp] = recent[0];
        }
      }
      setSplitHistory(historyMap);
    }
    loadRecentSplits();
  }, []);

  const splitsConfig: { name: SplitType; label: string; desc: string; badge: string }[] = [
    {
      name: 'Push',
      label: 'Push Day',
      desc: 'Chest, Shoulders & Triceps',
      badge: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      name: 'Pull',
      label: 'Pull Day',
      desc: 'Back, Lats & Biceps',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      name: 'Legs',
      label: 'Leg Day',
      desc: 'Quads, Hamstrings & Calves',
      badge: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      name: 'Arms',
      label: 'Arms & Shoulders',
      desc: 'Biceps, Triceps & Delts Focus',
      badge: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    {
      name: 'Core',
      label: 'Core & Abs',
      desc: 'Abdominals, Obliques & Lower Back',
      badge: 'bg-rose-50 text-rose-800 border-rose-200'
    }
  ];

  const formatDaysAgo = (dateStr?: string) => {
    if (!dateStr) return 'Not logged yet';
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Trained today';
    if (diffDays === 1) return 'Trained yesterday';
    return `Trained ${diffDays} days ago`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Draft Recovery Banner if active session was interrupted */}
      {hasDraft && draftInfo && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Unfinished Workout In Progress
              </h4>
              <p className="text-base font-bold text-slate-900 mt-0.5">{draftInfo.title}</p>
              <p className="text-xs text-slate-600">Zero-data-loss session draft preserved in local storage</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              onClick={onDiscardDraft}
              className="min-h-touch px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={onResumeDraft}
              className="min-h-touch px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Resume Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Intro banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <h2 className="text-base font-bold text-slate-900">1-Tap &quot;Clone Last Workout&quot; Quickstart</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Select a split below to clone your previous session. Automatically pulls all exercises and injects your previous weights and reps as ghost-text targets.
        </p>
      </div>

      {/* Responsive Splits Grid: 1 col on mobile, 2 cols on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {splitsConfig.map(split => {
          const lastSession = splitHistory[split.name];
          const hasPrevious = Boolean(lastSession);

          return (
            <div
              key={split.name}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${split.badge}`}>
                    {split.name}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDaysAgo(lastSession?.started_at)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-3">
                  {split.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{split.desc}</p>
              </div>

              {/* Action Buttons: Dark flat buttons with rounded corners */}
              <div className="flex items-center gap-2.5 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onStartWorkout(split.name, `${split.name} Session`, true)}
                  className="flex-1 min-h-touch px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{hasPrevious ? 'Clone (1-Tap)' : 'Start Split'}</span>
                </button>

                <button
                  onClick={() => onStartWorkout(split.name, `${split.name} Session`, false)}
                  title="Start fresh without cloning previous weights"
                  className="min-h-touch px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-slate-500" />
                  <span>Blank</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
