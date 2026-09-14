import React, { useEffect } from 'react';
import { RotateCcw, X, CheckCircle, FastForward } from 'lucide-react';
import type { BlockStatus } from '../types';

interface ToastUndoProps {
  blockName: string;
  action: BlockStatus; // 'done' | 'skipped'
  onUndo: () => void;
  onDismiss: () => void;
}

export const ToastUndo: React.FC<ToastUndoProps> = ({
  blockName,
  action,
  onUndo,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isDone = action === 'done';

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.25rem)] left-4 right-4 z-45 max-w-sm mx-auto animate-in slide-in-from-bottom-3 duration-200">
      <div className="bg-warm-900 dark:bg-warm-100 text-white dark:text-warm-900 rounded-xl px-3.5 py-2.5 shadow-lifted border border-warm-700/60 dark:border-warm-300/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate text-xs">
          {isDone ? (
            <CheckCircle className="w-4 h-4 text-focus-400 dark:text-focus-600 shrink-0" />
          ) : (
            <FastForward className="w-4 h-4 text-warm-400 shrink-0" />
          )}
          <span className="truncate">
            <span className="font-semibold">{isDone ? 'Marked done:' : 'Skipped:'}</span>{' '}
            <span className="opacity-90">{blockName}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onUndo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 dark:bg-warm-900/15 hover:bg-white/25 dark:hover:bg-warm-900/25 text-xs font-bold transition-all text-focus-300 dark:text-focus-600"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1 text-warm-400 hover:text-white dark:hover:text-warm-900 rounded"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
