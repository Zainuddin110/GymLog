import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useRestTimer } from '../../hooks/useRestTimer';
import { useWakeLock } from '../../hooks/useWakeLock';
import { RestTimer } from '../timer/RestTimer';
import { ExerciseCard } from './ExerciseCard';
import { ExercisePickerModal } from './ExercisePickerModal';
import { CreateExerciseModal } from './CreateExerciseModal';
import { ActiveExerciseSession, ActiveWorkoutSet, Exercise } from '../../types/gym';
import { Plus, CheckCircle2, XCircle, Clock, StickyNote } from 'lucide-react';

interface ActiveWorkoutViewProps {
  userId: string;
  title: string;
  splitType: string;
  elapsedSeconds: number;
  exercises: ActiveExerciseSession[];
  notes: string;
  setNotes: (notes: string) => void;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise: (index: number) => void;
  onUpdateExerciseNotes: (index: number, notes: string) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<ActiveWorkoutSet>) => void;
  onToggleSetComplete: (exerciseIndex: number, setIndex: number) => boolean;
  onFinishWorkout: () => Promise<boolean>;
  onCancelWorkout: () => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  userId,
  title,
  splitType,
  elapsedSeconds,
  exercises,
  notes,
  setNotes,
  onAddExercise,
  onRemoveExercise,
  onUpdateExerciseNotes,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSetComplete,
  onFinishWorkout,
  onCancelWorkout
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Screen Wake Lock automatically engaged during active workout
  const { isLocked: isWakeLockActive } = useWakeLock(true);

  // Rest Timer hook
  const {
    formattedTime,
    isRunning,
    timeLeft,
    startTimer,
    toggleTimer,
    addSeconds,
    stopTimer
  } = useRestTimer(90);

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    const willBeCompleted = onToggleSetComplete(exIdx, setIdx);
    if (willBeCompleted) {
      // Auto-start rest interval on set completion
      startTimer(90);
    }
  };

  const handleFinish = async () => {
    if (window.confirm('Finish and save this workout?')) {
      setIsFinishing(true);
      try {
        const success = await onFinishWorkout();
        if (success) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      } finally {
        setIsFinishing(false);
      }
    }
  };

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Session Title & Elapsed Time Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {splitType} Split
            </span>
            <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● In Progress
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-sm font-bold text-slate-800">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Discard this workout? All unsaved data will be lost.')) {
                onCancelWorkout();
              }
            }}
            className="min-h-touch h-10 w-10 rounded-xl hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
            title="Discard Workout"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rest Timer Panel */}
      <RestTimer
        formattedTime={formattedTime}
        isRunning={isRunning}
        timeLeft={timeLeft}
        isWakeLockActive={isWakeLockActive}
        onAddSeconds={addSeconds}
        onStartTimer={startTimer}
        onToggleTimer={toggleTimer}
        onStopTimer={stopTimer}
      />

      {/* Exercise Cards */}
      {exercises.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
          <p className="text-sm font-medium text-slate-500">No exercises added yet to this workout.</p>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add First Exercise
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {exercises.map((exSession, exIdx) => (
            <ExerciseCard
              key={exSession.exercise.id + exIdx}
              exerciseSession={exSession}
              exerciseIndex={exIdx}
              onUpdateNotes={notes => onUpdateExerciseNotes(exIdx, notes)}
              onAddSet={() => onAddSet(exIdx)}
              onRemoveSet={setIdx => onRemoveSet(exIdx, setIdx)}
              onUpdateSet={(setIdx, updates) => onUpdateSet(exIdx, setIdx, updates)}
              onToggleSetComplete={setIdx => handleToggleSet(exIdx, setIdx)}
              onRemoveExercise={() => onRemoveExercise(exIdx)}
            />
          ))}
        </div>
      )}

      {/* Add Exercise CTA Button */}
      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="w-full min-h-touch h-12 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Exercise to Session</span>
      </button>

      {/* General Workout Session Notes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-slate-500" />
          <span>Session Notes (Optional)</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Energy levels, pre-workout, injuries, pump notes..."
          className="w-full bg-slate-50 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
        />
      </div>

      {/* Finish Workout CTA Button: Dark flat button with rounded corners */}
      <button
        type="button"
        disabled={isFinishing || exercises.length === 0}
        onClick={handleFinish}
        className="w-full min-h-touch h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98"
      >
        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        <span>{isFinishing ? 'Saving & Syncing...' : 'Finish Workout & Save Session'}</span>
      </button>

      {/* Modals */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={onAddExercise}
        onOpenCreateNew={() => setIsCreateOpen(true)}
      />

      <CreateExerciseModal
        isOpen={isCreateOpen}
        userId={userId}
        onClose={() => setIsCreateOpen(false)}
        onCreated={ex => {
          onAddExercise(ex);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
};
