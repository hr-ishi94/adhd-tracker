import React from 'react';
import type { ScreenTab } from '../types';
import { House, Timer, Map, HeartPulse, Menu } from 'lucide-react';

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
    { id: 'today', label: 'Today', icon: House },
    { id: 'pomodoro', label: 'Timer', icon: Timer },
    { id: 'learning', label: 'Roadmap', icon: Map },
    { id: 'habits', label: 'Habits', icon: HeartPulse },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFCF6]/95 dark:bg-warm-900/95 backdrop-blur-xl border-t border-warm-200 dark:border-warm-800 safe-bottom"
    >
      <div className="max-w-md mx-auto px-2 pt-1.5 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isMoreSubTab = ['review', 'retro', 'inbox', 'settings', 'profile'].includes(currentTab);
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'learning' && currentTab === 'roadmap') ||
            (tab.id === 'today' && currentTab === 'schedule') ||
            (tab.id === 'more' && isMoreSubTab);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-w-[60px] min-h-[52px] px-2 rounded-2xl transition-all ${
                isActive
                  ? 'bg-focus-50 dark:bg-focus-950/60 text-focus-600 dark:text-focus-400'
                  : 'text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.id === 'more' && inboxCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-focus-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {inboxCount > 9 ? '9+' : inboxCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
