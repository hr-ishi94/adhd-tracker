import React from 'react';
import { Bell, Clock, X } from 'lucide-react';
import type { RoutineBlock } from '../types';

interface BannerNotificationProps {
  block: RoutineBlock | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onGoToToday: () => void;
}

export const BannerNotification: React.FC<BannerNotificationProps> = ({
  block,
  onDismiss,
  onSnooze,
  onGoToToday,
}) => {
  if (!block) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top-4 duration-300">
      <div className="bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900 rounded-2xl p-4 shadow-2xl border border-warm-700/50 dark:border-warm-300/50 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-focus-600 text-white rounded-xl">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-warm-300 dark:text-warm-600 font-medium">
                Scheduled Block
              </p>
              <h3 className="text-base font-bold leading-tight">
                It's {block.name} time
              </h3>
              <p className="text-xs text-warm-300 dark:text-warm-600 mt-0.5">
                {block.startTime} – {block.endTime}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-warm-400 hover:text-white dark:hover:text-warm-900 p-1 rounded-lg"
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 dark:border-warm-900/10 text-xs">
          <button
            onClick={() => {
              onGoToToday();
              onDismiss();
            }}
            className="font-medium text-focus-400 dark:text-focus-600 hover:underline"
          >
            Go to block →
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-warm-400 dark:text-warm-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Snooze:
            </span>
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => onSnooze(mins)}
                className="px-2 py-1 rounded-lg bg-white/10 dark:bg-warm-900/10 hover:bg-white/20 dark:hover:bg-warm-900/20 font-medium text-xs transition-colors"
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
