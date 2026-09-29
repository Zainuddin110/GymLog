import React, { useState, useEffect } from 'react';
import { useUnit } from '../../context/UnitContext';
import { useAuth } from '../../context/AuthContext';
import { Wifi, WifiOff, Cloud, Database } from 'lucide-react';

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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-base shadow-sm">
            G
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              GymLog
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Offline-First
              </span>
            </h1>
            <p className="text-xs text-slate-500">Dual-Tier Hybrid Storage</p>
          </div>
        </div>

        {/* Action Badges: Unit Switcher & Sync Status */}
        <div className="flex items-center gap-2.5">
          {/* 1-Tap Unit Toggle */}
          <button
            onClick={toggleUnit}
            aria-label="Toggle measurement unit"
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-slate-500 font-medium">Unit:</span>
            <span className="text-slate-900 font-extrabold uppercase">{unit}</span>
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
            className="cursor-pointer h-10 px-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2 text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs text-amber-700 font-medium hidden sm:inline">Offline</span>
              </>
            ) : isCloudConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs text-slate-800 font-medium hidden sm:inline">Cloud Synced</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs text-emerald-800 font-medium hidden sm:inline">Local Storage</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
