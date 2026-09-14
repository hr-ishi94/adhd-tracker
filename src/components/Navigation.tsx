import React from 'react';
import type { ScreenTab } from '../types';
import { Compass, Inbox, Moon, BarChart2, Settings } from 'lucide-react';

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
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'review', label: 'Review', icon: Moon },
    { id: 'retro', label: 'Retro', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-warm-900/95 backdrop-blur-md border-t border-warm-200/80 dark:border-warm-800 transition-colors"
    >
      <div className="max-w-md mx-auto px-2 flex justify-around items-center safe-bottom py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id || (tab.id === 'settings' && currentTab === 'roadmap');

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-focus-600 dark:text-focus-500 font-semibold'
                  : 'text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'inbox' && inboxCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-focus-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {inboxCount > 9 ? '9+' : inboxCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-focus-600 dark:bg-focus-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
