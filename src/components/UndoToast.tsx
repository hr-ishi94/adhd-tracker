import React, { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ message, onUndo, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed left-4 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] z-50 max-w-sm mx-auto animate-pop-in">
      <div className="bg-warm-800 text-white rounded-2xl px-4 py-3 shadow-lifted flex items-center justify-between gap-3 text-sm">
        <span className="truncate">{message}</span>
        <button type="button" onClick={onUndo} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 font-bold text-focus-300 shrink-0">
          <RotateCcw className="w-3.5 h-3.5" /> Undo
        </button>
      </div>
    </div>
  );
};
