import React from 'react';
import type { ScreenTab } from '../types';
import { Compass, Timer, GraduationCap, ShieldCheck, MoreHorizontal } from 'lucide-react';

interface NavigationProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  inboxCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  inboxCount = 0,
}) => {
  const tabs: { id: ScreenTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: Compass },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'learning', label: 'Learning', icon: GraduationCap },
    { id: 'habits', label: 'Habits', icon: ShieldCheck },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-2.5 safe-bottom pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto bg-white/85 dark:bg-warm-900/85 backdrop-blur-2xl border border-white/70 dark:border-white/10 rounded-[32px] px-2 py-1.5 flex justify-around items-center shadow-lifted transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isMoreSubTab = ['review', 'retro', 'inbox', 'settings'].includes(currentTab);
          const isActive = currentTab === tab.id || (tab.id === 'learning' && currentTab === 'roadmap') || (tab.id === 'more' && isMoreSubTab);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[50px] py-1 px-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-focus-600 dark:text-focus-400 font-black'
                  : 'text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-115 text-focus-600 dark:text-focus-400 stroke-[2.5]' : ''}`} />
                {tab.id === 'more' && inboxCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-focus-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {inboxCount > 9 ? '9+' : inboxCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-extrabold text-focus-600 dark:text-focus-400' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-focus-600 dark:bg-focus-500 rounded-full mt-0.5 shadow-xs animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
