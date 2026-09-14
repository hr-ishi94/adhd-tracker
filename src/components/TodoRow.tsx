import React from 'react';
import type { TodoItem, TodoPriority } from '../types';
import { Check, Trash2, ArrowDown, ArrowUp } from 'lucide-react';

interface TodoRowProps {
  todo: TodoItem;
  onToggleDone: (id: string) => void;
  onChangePriority?: (id: string, newPriority: TodoPriority) => void;
  onDelete?: (id: string) => void;
  isCompact?: boolean; // For single-line top-A display
}

export const TodoRow: React.FC<TodoRowProps> = ({
  todo,
  onToggleDone,
  onChangePriority,
  onDelete,
  isCompact = false,
}) => {
  const isDone = todo.status === 'done';

  const badgeColor = {
    A: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300/70 dark:border-amber-800',
    B: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300/70 dark:border-sky-800',
    C: 'bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 border-warm-300/70 dark:border-warm-700',
  }[todo.priority];

  return (
    <div
      className={`group flex items-center justify-between gap-2 transition-all ${
        isCompact
          ? 'py-1 px-1'
          : 'py-2 px-2.5 rounded-xl bg-warm-50/70 dark:bg-warm-900/60 border border-warm-200/60 dark:border-warm-800/60 hover:bg-white dark:hover:bg-warm-850'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* 1-Tap Done checkbox */}
        <button
          onClick={() => onToggleDone(todo.id)}
          aria-label={isDone ? 'Mark to-do pending' : 'Mark to-do done'}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
            isDone
              ? 'bg-focus-600 border-focus-600 text-white'
              : 'border-warm-300 dark:border-warm-600 hover:border-focus-500 text-transparent hover:text-focus-600 dark:hover:text-focus-400'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Priority Badge */}
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${badgeColor}`}
        >
          {todo.priority}
        </span>

        {/* Text */}
        <span
          className={`text-xs sm:text-sm font-medium truncate ${
            isDone
              ? 'line-through text-warm-400 dark:text-warm-500'
              : 'text-warm-800 dark:text-warm-200'
          }`}
        >
          {todo.text}
        </span>
      </div>

      {/* Quick Actions (Change priority / Delete) */}
      {!isDone && (
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onChangePriority && todo.priority !== 'C' && (
            <button
              onClick={() => {
                const nextPriority = todo.priority === 'A' ? 'B' : 'C';
                onChangePriority(todo.id, nextPriority);
              }}
              title={`Demote to ${todo.priority === 'A' ? 'B' : 'C'}`}
              className="p-1 text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 rounded transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}

          {onChangePriority && todo.priority !== 'A' && (
            <button
              onClick={() => {
                const prevPriority = todo.priority === 'C' ? 'B' : 'A';
                onChangePriority(todo.id, prevPriority);
              }}
              title={`Promote to ${todo.priority === 'C' ? 'B' : 'A'}`}
              className="p-1 text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 rounded transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(todo.id)}
              title="Remove to-do"
              aria-label="Remove to-do"
              className="p-1 text-warm-400 hover:text-red-500 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
