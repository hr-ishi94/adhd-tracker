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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-warm-900/95 backdrop-blur-md border-t border-warm-200/80 dark:border-warm-800 transition-colors shadow-lifted"
    >
      <div className="max-w-md mx-auto px-2 flex justify-around items-center safe-bottom py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isMoreSubTab = ['review', 'retro', 'inbox', 'settings'].includes(currentTab);
          const isActive = currentTab === tab.id || (tab.id === 'learning' && currentTab === 'roadmap') || (tab.id === 'more' && isMoreSubTab);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[62px] min-h-[54px] py-1 px-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-focus-600 dark:text-focus-500 font-extrabold'
                  : 'text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'more' && inboxCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-focus-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {inboxCount > 9 ? '9+' : inboxCount}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 tracking-tight ${isActive ? 'font-extrabold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-focus-600 dark:bg-focus-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
