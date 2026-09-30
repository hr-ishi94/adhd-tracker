import React, { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play, X } from 'lucide-react';
import type { Item } from '../types';
import { ART } from '../components/ui';
import { soundPlayer } from '../lib/audio';

interface FocusOverlayProps {
  item: Item;
  minutes: number;
  sound: boolean;
  onDone: () => void;
  onStop: () => void;
}

const MESSAGES = ["I'm here with you.", 'Just this one thing.', 'You started. That was the hard part.', 'Slow is fine. Keep going.'];
const RING = 2 * Math.PI * 100;

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const FocusOverlay: React.FC<FocusOverlayProps> = ({ item, minutes, sound, onDone, onStop }) => {
  const [length, setLength] = useState(minutes);
  const [total, setTotal] = useState(minutes * 60_000);
  const [left, setLeft] = useState(minutes * 60_000);
  const [endAt, setEndAt] = useState<number | null>(() => Date.now() + minutes * 60_000);
  const [finished, setFinished] = useState(false);
  const chimed = useRef(false);

  useEffect(() => {
    if (endAt === null) return;
    const tick = () => {
      const remaining = endAt - Date.now();
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        setEndAt(null);
        setFinished(true);
        if (sound && !chimed.current) {
          chimed.current = true;
          soundPlayer.playFocusDoneChime();
        }
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt, sound]);

  const restart = (mins: number) => {
    setLength(mins);
    setTotal(mins * 60_000);
    setLeft(mins * 60_000);
    setEndAt(Date.now() + mins * 60_000);
    setFinished(false);
    chimed.current = false;
  };

  const keepGoing = () => {
    setTotal(10 * 60_000);
    setLeft(10 * 60_000);
    setEndAt(Date.now() + 10 * 60_000);
    setFinished(false);
    chimed.current = false;
  };

  const togglePause = () => {
    if (endAt === null) setEndAt(Date.now() + left);
    else setEndAt(null);
  };

  const running = endAt !== null;
  const progress = total > 0 ? left / total : 0;
  const message = MESSAGES[Math.floor((1 - progress) * (MESSAGES.length - 0.01))];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#F6E6CC] to-[#F7F0E3] dark:from-warm-900 dark:to-warm-950" role="dialog" aria-modal="true" aria-label="Focus timer">
      <div className="max-w-md mx-auto min-h-full flex flex-col px-5 pt-5 pb-8 safe-top">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-warm-500">Focusing on</p>
            <h1 className="text-xl font-extrabold text-warm-800 dark:text-warm-50 break-words">{item.text}</h1>
            {item.firstStep && (
              <p className="text-sm text-warm-600 dark:text-warm-300 mt-0.5">
                <span className="font-bold">First step:</span> {item.firstStep}
              </p>
            )}
          </div>
          <button type="button" onClick={onStop} aria-label="Close" className="w-11 h-11 rounded-full bg-white/70 dark:bg-warm-800 flex items-center justify-center text-warm-600 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mx-auto mt-4">
          <img src={ART.focusMascot} alt="" aria-hidden="true" className="w-40 h-40 object-cover rounded-full [mask-image:radial-gradient(circle,black_60%,transparent_72%)]" />
          <div className="absolute -right-24 top-2 max-w-[140px] bg-white dark:bg-warm-800 rounded-2xl rounded-bl-sm px-3 py-2 shadow-soft text-xs font-bold text-warm-700 dark:text-warm-100">
            {finished ? 'Nice work!' : message}
          </div>
        </div>

        <div className="relative mx-auto mt-2 w-56 h-56">
          <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="focus-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F0B84A" />
                <stop offset="100%" stopColor="#8FB085" />
              </linearGradient>
            </defs>
            <circle cx="110" cy="110" r="100" fill="none" stroke="#EDE1CB" strokeWidth="14" />
            <circle
              cx="110"
              cy="110"
              r="100"
              fill="none"
              stroke="url(#focus-ring)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.25s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold tabular-nums text-warm-800 dark:text-warm-50">{fmt(left)}</span>
            <span className="text-sm text-warm-500">{finished ? 'Time!' : running ? 'left' : 'paused'}</span>
          </div>
        </div>

        {finished ? (
          <div className="mt-6 space-y-3">
            <p className="text-center font-extrabold text-warm-800 dark:text-warm-50">Keep going or stop? Both are okay.</p>
            <button type="button" onClick={onDone} className="btn-primary w-full py-4 text-lg gap-2">
              <Check className="w-5 h-5" /> Done
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={keepGoing} className="card rounded-2xl py-3.5 font-bold text-warm-800 dark:text-warm-100">
                Keep going +10
              </button>
              <button type="button" onClick={onStop} className="card rounded-2xl py-3.5 font-bold text-warm-600 dark:text-warm-300">
                Stop for now
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={togglePause} className="card rounded-2xl py-4 font-bold text-warm-800 dark:text-warm-100 flex items-center justify-center gap-2">
                {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />} {running ? 'Pause' : 'Resume'}
              </button>
              <button type="button" onClick={onDone} className="btn-primary rounded-2xl py-4 gap-2">
                <Check className="w-5 h-5" /> I'm done
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[10, 25].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => restart(m)}
                  className={`px-4 py-2 rounded-full text-xs font-bold ${length === m ? 'bg-warm-800 text-white dark:bg-warm-100 dark:text-warm-900' : 'text-warm-500'}`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
