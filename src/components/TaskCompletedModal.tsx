import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ART, CoinIcon } from './ui';

interface TaskCompletedModalProps {
  isOpen: boolean;
  taskName: string;
  coins: number;
  onClose: () => void;
}

export const TaskCompletedModal: React.FC<TaskCompletedModalProps> = ({ isOpen, taskName, coins, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.45 },
      colors: ['#F0B84A', '#E0621F', '#6B925F', '#FFFCF6'],
    });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Task completed"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-b from-[#3B2A1C] to-[#221811] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={ART.celebrate} alt="" aria-hidden="true" className="w-full h-64 object-cover object-top" />

        {/* Tilted ticket */}
        <div className="relative -mt-14 mx-6 animate-pop-in">
          <div className="card-honey rounded-2xl px-5 py-4 text-center border-2 border-honey-300 shadow-xl">
            <p className="text-2xl font-extrabold text-warm-800 tracking-tight">Task Completed!</p>
            <p className="text-sm font-semibold text-warm-600 mt-0.5 truncate">{taskName}</p>
            <div className="mt-2 inline-flex items-center gap-2">
              <CoinIcon className="w-8 h-8" />
              <span className="text-2xl font-black text-warm-800">+{coins} coins</span>
            </div>
          </div>
        </div>

        <p className="px-8 pt-6 text-center text-[15px] font-medium text-warm-100/90 leading-snug">
          “Small steps every day lead to big results.”
        </p>

        <div className="p-6 pt-5">
          <button type="button" onClick={onClose} className="btn-primary w-full py-3.5 text-base">
            Nice!
          </button>
        </div>
      </div>
    </div>
  );
};
