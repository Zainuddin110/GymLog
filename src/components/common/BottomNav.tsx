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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-2 transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all min-h-[48px] min-w-[56px] ${
                isActive ? 'text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className="text-xs mt-1">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
