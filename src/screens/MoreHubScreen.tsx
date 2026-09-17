import React from 'react';
import type { ScreenTab } from '../types';
import { 
  Inbox, 
  Moon, 
  BarChart2, 
  Settings, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface MoreHubScreenProps {
  onNavigate: (tab: ScreenTab) => void;
  inboxCount: number;
}

export const MoreHubScreen: React.FC<MoreHubScreenProps> = ({
  onNavigate,
  inboxCount,
}) => {
  const sections = [
    {
      title: 'Daily & Weekly Reviews',
      items: [
        {
          id: 'review' as ScreenTab,
          label: 'Evening Review',
          description: '3 quick questions, friction chips & honest reflections',
          icon: Moon,
          badge: null,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
        },
        {
          id: 'retro' as ScreenTab,
          label: 'Weekly Retro',
          description: 'Weekly patterns, sitting todos & week-in-review notes',
          icon: BarChart2,
          badge: null,
          color: 'text-focus-600 bg-focus-50 dark:bg-focus-950/40',
        },
      ],
    },
    {
      title: 'Organization & Capture',
      items: [
        {
          id: 'inbox' as ScreenTab,
          label: 'Brain Dump Inbox',
          description: 'Convert captured racing thoughts into actionable todos',
          icon: Inbox,
          badge: inboxCount > 0 ? `${inboxCount} new` : null,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
        },
      ],
    },
    {
      title: 'Preferences & Routine Sets',
      items: [
        {
          id: 'settings' as ScreenTab,
          label: 'Schedule & Routine Settings',
          description: 'Weekday vs Weekend routines, theme, sound & backups',
          icon: Settings,
          badge: null,
          color: 'text-warm-600 bg-warm-100 dark:bg-warm-800',
        },
      ],
    },
  ];

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-warm-100 dark:bg-warm-850 text-warm-700 dark:text-warm-300 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-focus-600" />
          <span>Calm Tools Hub</span>
        </div>
        <h1 className="text-2xl font-black text-warm-900 dark:text-warm-100 tracking-tight">
          More & Reviews
        </h1>
        <p className="text-xs text-warm-500 dark:text-warm-400">
          Everything kept organized without cluttering your daily focus.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-warm-500 px-1">
              {section.title}
            </h2>
            <div className="bg-white dark:bg-warm-850 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft overflow-hidden divide-y divide-warm-100 dark:divide-warm-800/60">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-warm-50 dark:hover:bg-warm-800/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${item.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-warm-900 dark:text-warm-100">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-focus-600 text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-warm-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer calm note */}
      <div className="p-3.5 rounded-2xl bg-warm-100/60 dark:bg-warm-900/40 border border-warm-200/60 dark:border-warm-800 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-warm-700 dark:text-warm-300">
          <ShieldCheck className="w-4 h-4 text-leaf-600" />
          <span>Zero-Panic ADHD Architecture</span>
        </div>
        <p className="text-[11px] text-warm-500">
          Take one thing at a time. The app remembers everything so your brain doesn’t have to.
        </p>
      </div>
    </div>
  );
};
