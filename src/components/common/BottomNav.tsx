import React from 'react';
import { Dumbbell, PlayCircle, History, User } from 'lucide-react';

export type TabType = 'logger' | 'quickstart' | 'history' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isWorkoutActive: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isWorkoutActive
}) => {
  const tabs = [
    {
      id: 'quickstart' as TabType,
      label: 'Quickstart',
      icon: PlayCircle
    },
    {
      id: 'logger' as TabType,
      label: 'Workout',
      icon: Dumbbell,
      badge: isWorkoutActive ? 'Active' : null
    },
    {
      id: 'history' as TabType,
      label: 'History',
      icon: History
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User
    }
  ];

  return (
    <nav className="fixed bottom-0 sm:bottom-3 left-0 right-0 z-40 px-3 transition-all pointer-events-none">
      <div className="flex items-center justify-around max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-1.5 shadow-lg shadow-slate-900/5 pointer-events-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all min-h-[48px] min-w-[58px] ${
                isActive
                  ? 'bg-slate-950 text-white font-extrabold shadow-xs'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
