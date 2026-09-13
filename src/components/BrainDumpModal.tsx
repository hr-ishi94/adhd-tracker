import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

export const BrainDumpModal: React.FC<BrainDumpModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      // Immediate autofocus to minimize friction
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim());
    setText('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter submits instantly
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-warm-900 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-warm-200 dark:border-warm-800 transition-all transform animate-in slide-in-from-bottom duration-200 safe-bottom"
      >
        <div className="flex items-center justify-between pb-3 border-b border-warm-100 dark:border-warm-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold text-warm-900 dark:text-warm-100">
              Quick Brain Dump
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Drop anything on your mind. No formatting needed..."
            className="w-full bg-warm-50 dark:bg-warm-850 text-warm-900 dark:text-warm-100 text-base rounded-xl p-3.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-warm-400 dark:text-warm-500 hidden sm:inline">
              Press ⌘/Ctrl + Enter to save
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-focus-600 hover:bg-focus-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-all shadow-sm active:scale-95"
              >
                <span>Save</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
