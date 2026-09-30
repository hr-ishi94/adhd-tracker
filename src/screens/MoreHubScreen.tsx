import React from 'react';
import type { ScreenTab } from '../types';
import { Inbox, Moon, BarChart2, Settings, ChevronRight } from 'lucide-react';
import { ART, ScreenHeader, Page } from '../components/ui';

interface MoreHubScreenProps {
  onNavigate: (tab: ScreenTab) => void;
  inboxCount: number;
}

export const MoreHubScreen: React.FC<MoreHubScreenProps> = ({ onNavigate, inboxCount }) => {
  const items = [
    {
      id: 'inbox' as ScreenTab,
      label: 'Brain Dump',
      description: 'Turn captured racing thoughts into todos',
      icon: Inbox,
      badge: inboxCount > 0 ? `${inboxCount}` : null,
      tile: 'bg-focus-100 text-focus-600 dark:bg-focus-950/50 dark:text-focus-300',
    },
    {
      id: 'review' as ScreenTab,
      label: 'Evening Review',
      description: '3 quick questions & honest reflections',
      icon: Moon,
      badge: null,
      tile: 'bg-honey-100 text-honey-500 dark:bg-honey-500/15 dark:text-honey-300',
    },
    {
      id: 'retro' as ScreenTab,
      label: 'Weekly Progress',
      description: 'Weekly patterns & week-in-review notes',
      icon: BarChart2,
      badge: null,
      tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    {
      id: 'settings' as ScreenTab,
      label: 'Settings',
      description: 'Routines, theme, sound & backups',
      icon: Settings,
      badge: null,
      tile: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300',
    },
  ];

  return (
    <Page>
      <ScreenHeader title="More" subtitle="Everything else, kept out of your way." />

      <div className="px-5 space-y-3">
        {/* Profile row */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="card w-full p-3.5 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
        >
          <img src={ART.profileAvatar} alt="" aria-hidden="true" className="w-14 h-14 rounded-full object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-extrabold text-warm-800 dark:text-warm-50">My Profile</p>
            <p className="text-xs text-warm-500 dark:text-warm-400">Coins, rewards &amp; achievements</p>
          </div>
          <ChevronRight className="w-5 h-5 text-warm-400" />
        </button>

        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="card w-full p-3.5 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${item.tile}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-warm-800 dark:text-warm-50">{item.label}</span>
                  {item.badge && (
                    <span className="min-w-[20px] text-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-focus-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5 truncate">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-warm-400" />
            </button>
          );
        })}
      </div>
    </Page>
  );
};
