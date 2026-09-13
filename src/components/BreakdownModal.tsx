import React, { useState, useEffect } from 'react';
import { X, CornerDownRight, Check } from 'lucide-react';
import type { RoutineBlock } from '../types';

interface BreakdownModalProps {
  isOpen: boolean;
  block: RoutineBlock | null;
  onClose: () => void;
  onSaveFirstStep: (blockId: string, firstStep: string) => void;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  isOpen,
  block,
  onClose,
  onSaveFirstStep,
}) => {
  const [firstStep, setFirstStep] = useState('');

  useEffect(() => {
    if (block) {
      setFirstStep(block.firstStep || '');
    }
  }, [block, isOpen]);

  if (!isOpen || !block) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveFirstStep(block.id, firstStep.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-warm-900 rounded-2xl p-5 shadow-2xl border border-warm-200 dark:border-warm-800 transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-warm-100 dark:border-warm-800">
          <div>
            <h2 className="text-sm font-semibold text-warm-900 dark:text-warm-100">
              Break It Down
            </h2>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              {block.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4">
          <label className="block text-xs font-medium text-warm-600 dark:text-warm-300 mb-2">
            First 10-minute step:
          </label>
          <div className="relative">
            <input
              type="text"
              value={firstStep}
              onChange={(e) => setFirstStep(e.target.value)}
              placeholder="e.g. Open editor and write function signature..."
              autoFocus
              className="w-full bg-warm-50 dark:bg-warm-850 text-warm-900 dark:text-warm-100 text-sm rounded-xl px-3.5 py-3 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500"
            />
          </div>
          <p className="text-[11px] text-warm-400 dark:text-warm-500 mt-2 flex items-center gap-1">
            <CornerDownRight className="w-3 h-3" />
            Pick the tiny physical action to unblock your momentum.
          </p>

          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-focus-600 hover:bg-focus-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Set First Step</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
