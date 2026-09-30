import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Mic } from 'lucide-react';
import type { BrainDumpTag } from '../types';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, tag?: BrainDumpTag) => void;
}

const TAGS: { id: BrainDumpTag; label: string; className: string }[] = [
  { id: 'task', label: 'Task', className: 'bg-[#E3EEFA] text-[#2F6FB0] dark:bg-sky-950/60 dark:text-sky-300' },
  { id: 'idea', label: 'Idea', className: 'bg-honey-100 text-[#8A5A12] dark:bg-honey-500/20 dark:text-honey-300' },
  { id: 'worry', label: 'Worry', className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  { id: 'later', label: 'Later', className: 'bg-warm-200 text-warm-700 dark:bg-warm-800 dark:text-warm-300' },
  { id: 'personal', label: 'Personal', className: 'bg-[#FDE5D3] text-focus-700 dark:bg-focus-900/40 dark:text-focus-300' },
  { id: 'work', label: 'Work', className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
];

export const BrainDumpModal: React.FC<BrainDumpModalProps> = ({ isOpen, onClose, onSave }) => {
  const [text, setText] = useState('');
  const [tag, setTag] = useState<BrainDumpTag | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setTag(undefined);
      // Immediate autofocus to minimize friction
      const timer = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim(), tag);
    setText('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter (or Cmd/Ctrl+Enter) submits; Shift+Enter adds a new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-warm-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#F7F0E3] dark:bg-warm-900 rounded-t-[28px] sm:rounded-[28px] px-5 pt-3 pb-5 shadow-2xl animate-in slide-in-from-bottom duration-200 safe-bottom"
      >
        <div className="mx-auto w-10 h-1.5 rounded-full bg-warm-300 dark:bg-warm-700 mb-3" aria-hidden="true" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-extrabold tracking-tight text-warm-800 dark:text-warm-50">Brain Dump</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-warm-200/70 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:text-warm-800 dark:hover:text-warm-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card !rounded-[20px] p-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder={"What's on your mind?\ne.g. idea, worry, task, reminder..."}
            className="w-full bg-transparent text-[15px] text-warm-800 dark:text-warm-100 placeholder:text-warm-400 dark:placeholder:text-warm-500 resize-none focus:outline-none leading-relaxed"
          />

          <div className="flex flex-wrap gap-1.5 mt-2">
            {TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTag((cur) => (cur === t.id ? undefined : t.id))}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${t.className} ${
                  tag === t.id ? 'ring-2 ring-offset-1 ring-warm-800 dark:ring-warm-100 ring-offset-transparent' : 'opacity-80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-warm-400 dark:text-warm-500">Enter to save</span>
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-warm-400 dark:text-warm-500" aria-hidden="true" />
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Save thought"
                className="w-10 h-10 rounded-full bg-focus-600 hover:bg-focus-700 disabled:opacity-50 text-white flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(224,98,31,0.6)] active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
