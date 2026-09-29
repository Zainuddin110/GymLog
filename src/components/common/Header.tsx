import React, { useState, useEffect } from 'react';
import { useUnit } from '../../context/UnitContext';
import { useAuth } from '../../context/AuthContext';
import { WifiOff, Cloud, Database } from 'lucide-react';

interface HeaderProps {
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { unit, toggleUnit } = useUnit();
  const { isCloudConnected, user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-white text-base shadow-xs ring-1 ring-black/5">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-slate-950">
                GymLog
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Offline-First • Dual Storage</p>
          </div>
        </div>

        {/* Action Badges: Unit Switcher & Sync Status */}
        <div className="flex items-center gap-2.5">
          {/* 1-Tap Unit Toggle */}
          <button
            onClick={toggleUnit}
            aria-label="Toggle measurement unit"
            className="h-9 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <span className="text-slate-400 font-medium">Unit:</span>
            <span className="text-slate-950 font-black uppercase">{unit}</span>
          </button>

          {/* Connectivity & Cloud Indicator */}
          <div
            onClick={onOpenAuth}
            title={
              !isOnline
                ? 'Working Offline. Changes saved locally to Dexie.'
                : isCloudConnected
                ? `Connected to Supabase (3-workout cap sync active) - ${user?.email || 'Logged In'}`
                : 'Standalone Dexie Mode (Configure Supabase in .env)'
            }
            className="cursor-pointer h-9 px-3.5 rounded-full border border-slate-200/80 bg-slate-100 hover:bg-slate-200/70 flex items-center gap-2 text-xs text-slate-700 transition-colors shadow-2xs"
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs text-amber-700 font-semibold hidden sm:inline">Offline</span>
              </>
            ) : isCloudConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs text-slate-800 font-bold hidden sm:inline">Cloud Connected</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs text-emerald-800 font-bold hidden sm:inline">Local Storage</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
