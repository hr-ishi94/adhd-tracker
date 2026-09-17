import React, { useState } from 'react';
import type { TodoItem, TodoPriority } from '../types';
import { TodoRow } from './TodoRow';
import { ChevronDown, ChevronUp, Plus, Check, AlertCircle } from 'lucide-react';
import { canAddTodo, getTodosByPriority } from '../lib/storage';

interface AdditionalTodosSectionProps {
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string, priority: TodoPriority) => boolean;
  onChangeTodoPriority: (id: string, newPriority: TodoPriority) => void;
  onDeleteTodo: (id: string) => void;
}

export const AdditionalTodosSection: React.FC<AdditionalTodosSectionProps> = ({
  todos,
  onToggleTodo,
  onAddTodo,
  onChangeTodoPriority,
  onDeleteTodo,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority>('A');
  const [capWarning, setCapWarning] = useState<string | null>(null);

  const openTodos = todos.filter((t) => t.status === 'open');
  const aItems = getTodosByPriority(todos, 'A');
  const bItems = getTodosByPriority(todos, 'B');
  const cItems = getTodosByPriority(todos, 'C');

  const topAItem = aItems[0];
  const remainingAItems = aItems.slice(1);
  const secondaryCount = bItems.length + cItems.length + remainingAItems.length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    if (!canAddTodo(todos, selectedPriority)) {
      setCapWarning(`Tier ${selectedPriority} is full (3/3 max). Complete or demote one first.`);
      setTimeout(() => setCapWarning(null), 4000);
      return;
    }

    const success = onAddTodo(newText.trim(), selectedPriority);
    if (success) {
      setNewText('');
      setCapWarning(null);
    }
  };

  const handleSelectPriority = (p: TodoPriority) => {
    setSelectedPriority(p);
    if (!canAddTodo(todos, p)) {
      setCapWarning(`Tier ${p} is full (3/3 max).`);
    } else {
      setCapWarning(null);
    }
  };

  return (
    <div className="space-y-1.5 pt-0.5">
      {/* Empty State: Clear, inviting card when no to-dos exist yet */}
      {!topAItem && openTodos.length === 0 && !isExpanded && (
        <div className="bg-white/80 dark:bg-warm-850/80 rounded-2xl p-3 sm:p-3.5 border border-dashed border-warm-300 dark:border-warm-700 shadow-soft flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/70 dark:border-amber-800">
              ABC
            </span>
            <span className="text-xs sm:text-sm font-bold text-warm-700 dark:text-warm-300">
              Additional To-Dos
            </span>
            <span className="text-xs text-warm-400 dark:text-warm-500">
              (Ad-hoc tasks)
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-focus-700 dark:text-focus-300 bg-focus-50 hover:bg-focus-100 dark:bg-focus-900/40 px-3 py-1.5 rounded-xl border border-focus-200/70 dark:border-focus-800/70 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add To-Do</span>
          </button>
        </div>
      )}

      {/* Top A item: Single line, readable, comfortable on mobile */}
      {topAItem && (
        <div className="bg-white dark:bg-warm-850 rounded-2xl px-3.5 py-2.5 border border-warm-200/90 dark:border-warm-800 shadow-soft transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/70 dark:border-amber-800 shrink-0">
                A
              </span>
              <span className="text-sm sm:text-base font-semibold text-warm-800 dark:text-warm-100 truncate">
                {topAItem.text}
              </span>
            </div>

            <button
              onClick={() => onToggleTodo(topAItem.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-focus-50 hover:bg-focus-100 dark:bg-focus-900/30 dark:hover:bg-focus-900/50 text-focus-700 dark:text-focus-300 font-bold text-xs sm:text-sm shrink-0 transition-colors border border-focus-200/60 dark:border-focus-800/60"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* When A item is present or items exist, show disclosure toggle */}
      {(topAItem || openTodos.length > 0 || isExpanded) && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-warm-600 hover:text-warm-900 dark:text-warm-400 dark:hover:text-warm-200 transition-colors py-1"
          >
            <span>
              {isExpanded
                ? 'Hide additional to-dos'
                : secondaryCount > 0
                ? `Show more to-dos (${secondaryCount})`
                : '+ Add / view to-dos (A/B/C)'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {!isExpanded && (
            <span className="text-[10px] text-warm-400">
              Max 3 per tier
            </span>
          )}
        </div>
      )}

      {/* Expanded Section: B & C items + remaining A items + Quick Add */}
      {isExpanded && (
        <div className="bg-white dark:bg-warm-850 rounded-2xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-3 animate-in fade-in duration-200">
          {/* Quick Add Bar */}
          <form onSubmit={handleAddSubmit} className="space-y-2 pb-2.5 border-b border-warm-100 dark:border-warm-800">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="New to-do (no pressure)..."
                maxLength={80}
                className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg bg-warm-50 dark:bg-warm-900 border border-warm-200/80 dark:border-warm-750 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-focus-500"
              />

              <button
                type="submit"
                disabled={!newText.trim()}
                className="px-2.5 py-1.5 rounded-lg bg-focus-600 hover:bg-focus-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Priority Selector Pills with Live Capacity Indicators */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-warm-400 font-medium">Priority:</span>
              <div className="flex items-center gap-1.5">
                {(['A', 'B', 'C'] as TodoPriority[]).map((p) => {
                  const count = p === 'A' ? aItems.length : p === 'B' ? bItems.length : cItems.length;
                  const isFull = count >= 3;
                  const isSelected = selectedPriority === p;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPriority(p)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] border transition-all ${
                        isSelected
                          ? p === 'A'
                            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-400'
                            : p === 'B'
                            ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-400'
                            : 'bg-warm-200 dark:bg-warm-700 text-warm-800 dark:text-warm-200 border-warm-400'
                          : isFull
                          ? 'opacity-40 bg-warm-100 dark:bg-warm-800 text-warm-400 border-transparent cursor-not-allowed'
                          : 'bg-warm-50 dark:bg-warm-900 text-warm-500 border-warm-200 dark:border-warm-750 hover:text-warm-800'
                      }`}
                    >
                      {p} ({count}/3)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cap Warning Prompt */}
            {capWarning && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{capWarning}</span>
              </div>
            )}
          </form>

          {/* List of Tasks grouped by Tier */}
          <div className="space-y-2.5">
            {/* Tier A */}
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider mb-1 px-1">
                <span>A • Must Do Today</span>
                <span>{aItems.length}/3</span>
              </div>
              {aItems.length === 0 ? (
                <p className="text-[11px] text-warm-400 dark:text-warm-500 px-1 italic">
                  No must-do items
                </p>
              ) : (
                <div className="space-y-1">
                  {aItems.map((item) => (
                    <TodoRow
                      key={item.id}
                      todo={item}
                      onToggleDone={onToggleTodo}
                      onChangePriority={onChangeTodoPriority}
                      onDelete={onDeleteTodo}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tier B */}
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400 tracking-wider mb-1 px-1">
                <span>B • Should Do If Time Allows</span>
                <span>{bItems.length}/3</span>
              </div>
              {bItems.length === 0 ? (
                <p className="text-[11px] text-warm-400 dark:text-warm-500 px-1 italic">
                  No should-do items
                </p>
              ) : (
                <div className="space-y-1">
                  {bItems.map((item) => (
                    <TodoRow
                      key={item.id}
                      todo={item}
                      onToggleDone={onToggleTodo}
                      onChangePriority={onChangeTodoPriority}
                      onDelete={onDeleteTodo}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tier C */}
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-warm-500 dark:text-warm-400 tracking-wider mb-1 px-1">
                <span>C • Nice To Do (No Cost If Slips)</span>
                <span>{cItems.length}/3</span>
              </div>
              {cItems.length === 0 ? (
                <p className="text-[11px] text-warm-400 dark:text-warm-500 px-1 italic">
                  No nice-to-do items
                </p>
              ) : (
                <div className="space-y-1">
                  {cItems.map((item) => (
                    <TodoRow
                      key={item.id}
                      todo={item}
                      onToggleDone={onToggleTodo}
                      onChangePriority={onChangeTodoPriority}
                      onDelete={onDeleteTodo}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
