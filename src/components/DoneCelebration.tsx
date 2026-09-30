import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ART } from './ui';

/** Short, instant reward. Closes itself — never blocks you. */
export const DoneCelebration: React.FC<{ taskName: string | null; onClose: () => void }> = ({ taskName, onClose }) => {
  useEffect(() => {
    if (!taskName) return;
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 }, colors: ['#F0B84A', '#E0621F', '#6B925F', '#FFFCF6'] });
    const t = setTimeout(onClose, 1800);
    return () => clearTimeout(t);
  }, [taskName, onClose]);

  if (!taskName) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6" onClick={onClose} role="status">
      <div className="w-full max-w-xs rounded-[28px] overflow-hidden bg-[#FFFCF6] dark:bg-warm-900 shadow-2xl text-center animate-pop-in">
        <img src={ART.celebrate} alt="" aria-hidden="true" className="w-full h-40 object-cover object-top" />
        <div className="p-5">
          <p className="text-2xl font-extrabold text-warm-800 dark:text-warm-50">Done! 🎉</p>
          <p className="text-sm text-warm-500 mt-1 truncate">{taskName}</p>
        </div>
      </div>
    </div>
  );
};
