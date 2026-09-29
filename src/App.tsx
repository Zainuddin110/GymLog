import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useActiveWorkout } from './hooks/useActiveWorkout';
import { initLocalDatabase } from './lib/db';
import { SyncManager } from './lib/syncManager';
import { Header } from './components/common/Header';
import { BottomNav, TabType } from './components/common/BottomNav';
import { SplitQuickstart } from './components/home/SplitQuickstart';
import { ActiveWorkoutView } from './components/logger/ActiveWorkoutView';
import { HistoryView } from './components/history/HistoryView';
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal } from './components/auth/AuthModal';
import { Download } from 'lucide-react';

export const App: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'local-member-1';

  const [activeTab, setActiveTab] = useState<TabType>('quickstart');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Initialize Dexie local database & sync queue on mount
  useEffect(() => {
    initLocalDatabase();
    SyncManager.processSyncQueue();
  }, []);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Active workout state machine
  const {
    isActive,
    workoutId,
    title,
    splitType,
    elapsedSeconds,
    notes,
    exercises,
    hasDraft,
    draftInfo,
    startWorkout,
    resumeDraft,
    discardDraft,
    addExercise,
    removeExercise,
    updateExerciseNotes,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    finishWorkout,
    cancelWorkout,
    setNotes
  } = useActiveWorkout(userId);

  const handleStartWorkout = async (split: any, customTitle?: string, clone = false) => {
    await startWorkout(split, customTitle, clone);
    setActiveTab('logger');
  };

  const handleResumeDraft = () => {
    if (resumeDraft()) {
      setActiveTab('logger');
    }
  };

  const handleFinishAndRedirect = async () => {
    const success = await finishWorkout();
    if (success) {
      setActiveTab('history');
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between transition-colors">
      {/* App Bar / Header */}
      <Header onOpenAuth={() => setIsAuthOpen(true)} />

      {/* PWA Install Banner */}
      {installPrompt && (
        <div className="bg-slate-900 text-white px-4 py-2.5 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Install GymLog on your device for standalone offline use</span>
            </div>
            <button
              onClick={handleInstallPWA}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Install App
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Responsive Container (fluid with max-w-5xl, spacious padding) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 overflow-y-auto">
        {activeTab === 'quickstart' && (
          <SplitQuickstart
            onStartWorkout={handleStartWorkout}
            hasDraft={hasDraft}
            draftInfo={draftInfo}
            onResumeDraft={handleResumeDraft}
            onDiscardDraft={discardDraft}
          />
        )}

        {activeTab === 'logger' && (
          isActive ? (
            <ActiveWorkoutView
              userId={userId}
              title={title}
              splitType={splitType}
              elapsedSeconds={elapsedSeconds}
              exercises={exercises}
              notes={notes}
              setNotes={setNotes}
              onAddExercise={addExercise}
              onRemoveExercise={removeExercise}
              onUpdateExerciseNotes={updateExerciseNotes}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onUpdateSet={updateSet}
              onToggleSetComplete={toggleSetComplete}
              onFinishWorkout={handleFinishAndRedirect}
              onCancelWorkout={cancelWorkout}
            />
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-md mx-auto my-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
                <span className="text-3xl">🏋️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Workout in Progress</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Choose a split from the Quickstart tab or clone your previous session to start tracking your sets.
              </p>
              <button
                onClick={() => setActiveTab('quickstart')}
                className="min-h-touch px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 inline-flex items-center gap-2"
              >
                Go to Quickstart
              </button>
            </div>
          )
        )}

        {activeTab === 'history' && <HistoryView />}

        {activeTab === 'profile' && <ProfileView onOpenAuth={() => setIsAuthOpen(true)} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isWorkoutActive={isActive}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default App;
