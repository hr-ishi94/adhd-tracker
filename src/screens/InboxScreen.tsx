import React, { useState } from 'react';
import type { BrainDumpItem, TodoItem, TodoPriority } from '../types';
import { Trash2, ArrowUpRight, CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { canAddTodo, getTodosByPriority } from '../lib/storage';

interface InboxScreenProps {
  items: BrainDumpItem[];
  todos: TodoItem[];
  onDeleteItem: (id: string) => void;
  onConvertToTodo: (item: BrainDumpItem, priority: TodoPriority) => boolean;
  onSetAsPrimaryFocus: (item: BrainDumpItem) => void;
  onClearAllDone: () => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({
  items,
  todos,
  onDeleteItem,
  onConvertToTodo,
  onSetAsPrimaryFocus,
  onClearAllDone,
}) => {
  const [activeConvertItemId, setActiveConvertItemId] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<{ id: string; msg: string } | null>(null);

  const activeItems = items.filter((item) => !item.convertedToTask);
  const convertedItems = items.filter((item) => item.convertedToTask);

  const aCount = getTodosByPriority(todos, 'A').length;
  const bCount = getTodosByPriority(todos, 'B').length;
  const cCount = getTodosByPriority(todos, 'C').length;

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

  const handleSelectPriority = (item: BrainDumpItem, priority: TodoPriority) => {
    if (!canAddTodo(todos, priority)) {
      setConvertError({
        id: item.id,
        msg: `Tier ${priority} is full (3/3 max). Demote or complete one first.`,
      });
      setTimeout(() => setConvertError(null), 4000);
      return;
    }

    const success = onConvertToTodo(item, priority);
    if (success) {
      setActiveConvertItemId(null);
      setConvertError(null);
    }
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-3.5 pt-2 pb-24 safe-top space-y-2.5">
      <div className="flex items-center justify-between mb-1 px-0.5">
        <div>
          <h1 className="text-xl font-bold text-warm-900 dark:text-warm-100">
            Brain Dump Inbox
          </h1>
          <p className="text-[11px] text-warm-500 dark:text-warm-400">
            Thoughts out of working memory. Convert to A/B/C or Today's Focus.
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
        <div className="text-center py-10 px-4 bg-white dark:bg-warm-850 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft">
          <p className="text-sm font-semibold text-warm-800 dark:text-warm-200">
            Your mind is clear
          </p>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 max-w-xs mx-auto">
            Whenever a thought distracts you during focus time, tap the <span className="font-bold">+</span> button to offload it instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeItems.map((item) => {
            const isConverting = activeConvertItemId === item.id;
            const hasError = convertError?.id === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft transition-all"
              >
                <p className="text-sm sm:text-base text-warm-900 dark:text-warm-100 whitespace-pre-wrap leading-relaxed">
                  {item.text}
                </p>

                {/* Conversion Drawer / Actions */}
                {isConverting ? (
                  <div className="mt-3 pt-2.5 border-t border-warm-100 dark:border-warm-800 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-warm-700 dark:text-warm-300">
                        Choose task priority:
                      </span>
                      <button
                        onClick={() => {
                          setActiveConvertItemId(null);
                          setConvertError(null);
                        }}
                        className="text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => handleSelectPriority(item, 'A')}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          aCount >= 3
                            ? 'opacity-40 bg-warm-100 dark:bg-warm-800 border-transparent cursor-not-allowed'
                            : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        <div className="font-bold text-xs">A (Must)</div>
                        <div className="text-[10px] opacity-75">{aCount}/3</div>
                      </button>

                      <button
                        onClick={() => handleSelectPriority(item, 'B')}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          bCount >= 3
                            ? 'opacity-40 bg-warm-100 dark:bg-warm-800 border-transparent cursor-not-allowed'
                            : 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/80 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                        }`}
                      >
                        <div className="font-bold text-xs">B (Should)</div>
                        <div className="text-[10px] opacity-75">{bCount}/3</div>
                      </button>

                      <button
                        onClick={() => handleSelectPriority(item, 'C')}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          cCount >= 3
                            ? 'opacity-40 bg-warm-100 dark:bg-warm-800 border-transparent cursor-not-allowed'
                            : 'bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-750 border-warm-300 dark:border-warm-700 text-warm-800 dark:text-warm-200'
                        }`}
                      >
                        <div className="font-bold text-xs">C (Nice)</div>
                        <div className="text-[10px] opacity-75">{cCount}/3</div>
                      </button>

                      <button
                        onClick={() => onSetAsPrimaryFocus(item)}
                        title="Set as Today's One Thing"
                        className="p-1.5 rounded-lg border border-focus-300 dark:border-focus-800 bg-focus-50 hover:bg-focus-100 dark:bg-focus-950/60 dark:hover:bg-focus-900 text-focus-800 dark:text-focus-200 text-center transition-all"
                      >
                        <div className="font-bold text-xs flex items-center justify-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Focus</span>
                        </div>
                        <div className="text-[10px] opacity-75">1 Thing</div>
                      </button>
                    </div>

                    {hasError && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{convertError.msg}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-warm-100 dark:border-warm-800 text-xs">
                    <span className="text-warm-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(item.createdAt)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveConvertItemId(item.id)}
                        title="Convert to Task (A/B/C or Focus)"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-focus-50 hover:bg-focus-100 dark:bg-focus-900/30 dark:hover:bg-focus-900/50 text-focus-700 dark:text-focus-300 font-medium transition-colors"
                      >
                        <span>Convert to Task</span>
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
                )}
              </div>
            );
          })}

          {convertedItems.length > 0 && (
            <div className="pt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-400 mb-2 px-1">
                Resolved / Converted
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
