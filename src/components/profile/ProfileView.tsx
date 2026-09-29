import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUnit } from '../../context/UnitContext';
import { calculateLifetimeStats } from '../../lib/analytics';
import { exportLifetimeDataAsCSV, exportLifetimeDataAsJSON } from '../../lib/exportUtils';
import { LifetimeStats } from '../../types/gym';
import {
  Shield,
  Flame,
  Award,
  LogOut,
  Sliders,
  FileSpreadsheet,
  FileCode2,
  HardDrive
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth }) => {
  const { user, profile, updateProfile, signOut, isCloudConnected } = useAuth();
  const { unit, toggleUnit } = useUnit();

  const [stats, setStats] = useState<LifetimeStats>({
    totalWorkouts: 0,
    weeklyStreak: 0,
    totalVolumeKg: 0,
    totalVolumeLbs: 0,
    favoriteSplit: null
  });
  const [isExporting, setIsExporting] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name || 'Gym Member');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    calculateLifetimeStats().then(setStats);
  }, []);

  useEffect(() => {
    if (profile?.full_name) setNameInput(profile.full_name);
  }, [profile?.full_name]);

  const handleSaveName = async () => {
    await updateProfile({ full_name: nameInput.trim() });
    setIsEditingName(false);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportLifetimeDataAsCSV();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await exportLifetimeDataAsJSON();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* User Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-xs">
              {profile?.full_name?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                  />
                  <button
                    onClick={handleSaveName}
                    className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">{profile?.full_name || 'Gym Member'}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'Local Offline Session (No Login Required)'}</p>
            </div>
          </div>

          <button
            onClick={isCloudConnected ? signOut : onOpenAuth}
            className="self-start sm:self-auto min-h-touch px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            {isCloudConnected ? (
              <>
                <LogOut className="w-4 h-4 text-slate-600" />
                <span>Sign Out</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-slate-700" />
                <span>Connect Supabase Cloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Responsive Grid: Analytics & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Lifetime Metrics Card (Aggregated locally from IndexedDB Dexie) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-slate-700" />
              <span>Lifetime Local Analytics</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              100% Client-Side
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-black text-slate-900">{stats.totalWorkouts}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Workouts</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-black text-emerald-700 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>{stats.weeklyStreak}w</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Active Streak</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-black text-slate-900">
                {unit === 'kg'
                  ? `${(stats.totalVolumeKg / 1000).toFixed(1)}t`
                  : `${(stats.totalVolumeLbs / 1000).toFixed(1)}k`}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Total Volume</div>
            </div>
          </div>

          {stats.favoriteSplit && (
            <div className="text-xs text-slate-500 pt-1 flex items-center justify-between font-medium">
              <span>Favorite Split:</span>
              <span className="font-bold text-slate-900 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 uppercase">
                {stats.favoriteSplit}
              </span>
            </div>
          )}
        </div>

        {/* Unit Preference Standard */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <Sliders className="w-5 h-5 text-slate-800" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Unit Preference</h4>
                <p className="text-xs text-slate-500 mt-0.5">Re-renders steppers across logger</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={toggleUnit}
              className="w-full min-h-touch px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-black text-slate-900 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
            >
              <span>Current Standard:</span>
              <span className={unit === 'kg' ? 'text-blue-700 underline font-black uppercase' : 'text-slate-500 uppercase'}>Kilograms (KG)</span>
              <span className="text-slate-400">/</span>
              <span className={unit === 'lbs' ? 'text-blue-700 underline font-black uppercase' : 'text-slate-500 uppercase'}>Pounds (LBS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Ownership & 1-Tap Export (Section 5) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-700" />
            <span>Data Freedom (Export My History)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Download your infinite IndexedDB workout archive directly through the browser. Zero server footprint and 100% client-side data privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="min-h-touch h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export .CSV (Spreadsheet)</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="min-h-touch h-12 rounded-xl border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <FileCode2 className="w-4 h-4 text-slate-700" />
            <span>Export .JSON (Database)</span>
          </button>
        </div>
      </div>

      {/* Dual-Tier Architecture Info Card */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-900">Dual-Tier Hybrid Storage Guarantee</div>
        <p className="text-xs leading-relaxed text-slate-500">
          Cloud database holds strictly 3 workouts per split via PostgreSQL triggers. Your device retains an infinite lifetime training history locally in Dexie.js.
        </p>
      </div>
    </div>
  );
};
