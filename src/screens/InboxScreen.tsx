import React from 'react';
import type { BrainDumpItem } from '../types';
import { Trash2, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

interface InboxScreenProps {
  items: BrainDumpItem[];
  onDeleteItem: (id: string) => void;
  onConvertToTask: (item: BrainDumpItem) => void;
  onClearAllDone: () => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({
  items,
  onDeleteItem,
  onConvertToTask,
  onClearAllDone,
}) => {
  const activeItems = items.filter((item) => !item.convertedToTask);
  const convertedItems = items.filter((item) => item.convertedToTask);

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' +
        date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-24 safe-top">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-100">
            Brain Dump Inbox
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
            Thoughts captured out of working memory. No pressure.
          </p>
        </div>
        {convertedItems.length > 0 && (
          <button
            onClick={onClearAllDone}
            className="text-xs text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 transition-colors"
          >
            Clear resolved
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-warm-850 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft">
          <p className="text-base font-semibold text-warm-800 dark:text-warm-200">
            Your mind is clear
          </p>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 max-w-xs mx-auto">
            Whenever a thought distracts you during focus time, tap the <span className="font-bold">+</span> button to offload it instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft transition-all"
            >
              <p className="text-sm sm:text-base text-warm-900 dark:text-warm-100 whitespace-pre-wrap leading-relaxed">
                {item.text}
              </p>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-warm-100 dark:border-warm-800 text-xs">
                <span className="text-warm-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(item.createdAt)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onConvertToTask(item)}
                    title="Set as Today's One Thing"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-focus-50 hover:bg-focus-100 dark:bg-focus-900/30 dark:hover:bg-focus-900/50 text-focus-700 dark:text-focus-300 font-medium transition-colors"
                  >
                    <span>Set as Today's Focus</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    aria-label="Delete thought"
                    className="p-1.5 text-warm-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {convertedItems.length > 0 && (
            <div className="pt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-400 mb-2 px-1">
                Resolved / Made Priority
              </h2>
              <div className="space-y-2 opacity-60">
                {convertedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-warm-100 dark:bg-warm-900/50 rounded-xl p-3 border border-warm-200/50 dark:border-warm-800/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-warm-500" />
                      <span className="line-through text-warm-600 dark:text-warm-400">
                        {item.text}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-warm-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
