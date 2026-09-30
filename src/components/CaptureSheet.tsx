import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CaptureSheetProps {
  isOpen: boolean;
  onSave: (text: string) => void;
  onClose: () => void;
}

export const CaptureSheet: React.FC<CaptureSheetProps> = ({ isOpen, onSave, onClose }) => {
  const [text, setText] = useState('');
  if (!isOpen) return null;

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSave(t);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Capture a thought"
        className="w-full max-w-md bg-[#FFFCF6] dark:bg-warm-900 rounded-t-[28px] p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-extrabold text-warm-800 dark:text-warm-50">Get it out of your head</p>
        <p className="text-xs text-warm-500 mb-3">It goes to Dump. Sort it later.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-2"
        >
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 min-w-0 rounded-2xl border border-[#F0E6D3] dark:border-warm-700 bg-white dark:bg-warm-850 px-4 py-3.5 text-base text-warm-800 dark:text-warm-50 placeholder:text-warm-400 outline-none focus:border-focus-400"
          />
          <button type="submit" aria-label="Save" disabled={!text.trim()} className="btn-primary w-12 h-12 !p-0 rounded-full shrink-0 disabled:opacity-40">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
