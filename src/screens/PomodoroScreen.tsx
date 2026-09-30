import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PomodoroStats } from '../types';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, ChevronLeft, Leaf } from 'lucide-react';
import { Trophy, Flame } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { soundPlayer } from '../lib/audio';
import { ART } from '../components/ui';

interface PomodoroScreenProps {
  pomodoroStats?: PomodoroStats;
  onSessionCompleted: () => void;
}

type TimerMode = 'focus' | 'rest' | 'long';

const FOCUS_SECONDS = 25 * 60;
const REST_SECONDS = 5 * 60;
const LONG_SECONDS = 15 * 60;

const MODE_SECONDS: Record<TimerMode, number> = {
  focus: FOCUS_SECONDS,
  rest: REST_SECONDS,
  long: LONG_SECONDS,
};

const MODE_LABEL: Record<TimerMode, string> = {
  focus: 'Focus',
  rest: 'Short Break',
  long: 'Long Break',
};

export const PomodoroScreen: React.FC<PomodoroScreenProps> = ({
  pomodoroStats,
  onSessionCompleted,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const totalDuration = MODE_SECONDS[mode];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (mode === 'focus') {
      soundPlayer.playFocusDoneChime();
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E0621F', '#F0B84A', '#8FB085', '#FBBF24'],
        });
      } catch {
        // fallback
      }
      setShowCelebration(true);
      onSessionCompleted();
      // Transition to rest
      setMode('rest');
      setTimeLeft(REST_SECONDS);
    } else {
      soundPlayer.playRestDoneChime();
      setMode('focus');
      setTimeLeft(FOCUS_SECONDS);
    }
  }, [mode, onSessionCompleted]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleTimerComplete]);

  const handleTogglePlay = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_SECONDS[mode]);
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_SECONDS[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress ring configuration
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, (totalDuration - timeLeft) / totalDuration));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const completedToday = pomodoroStats?.todayCompleted || 0;
  const totalFocusMinutes = completedToday * 25;

  const isPaused = !isRunning && timeLeft < totalDuration && timeLeft > 0;
  const isBreak = mode !== 'focus';

  const bubbleTitle = isBreak ? 'Nice, breathe.' : isRunning ? 'Stay with it!' : "Let's focus!";
  const bubbleSub = isBreak ? 'Rest your eyes a bit.' : isRunning ? 'One thing at a time.' : 'You can do this.';

  const modeCards: { key: TimerMode; label: string; mins: number }[] = [
    { key: 'focus', label: 'Focus', mins: FOCUS_SECONDS / 60 },
    { key: 'rest', label: 'Short Break', mins: REST_SECONDS / 60 },
    { key: 'long', label: 'Long Break', mins: LONG_SECONDS / 60 },
  ];

  return (
    <div className="flex-1 max-w-md mx-auto w-full pb-28 flex flex-col items-center text-center">
      {/* Top gradient area with header + mascot */}
      <div className="relative w-full px-4 pt-3 safe-top bg-gradient-to-b from-[#F6E6CC] to-[#F7F0E3] dark:from-warm-900 dark:to-warm-950">
        <div className="flex items-center justify-between h-10">
          <span className="w-9 h-9 flex items-center justify-center text-warm-700 dark:text-warm-300" aria-hidden="true">
            <ChevronLeft className="w-5 h-5" />
          </span>
          <h1 className="text-[17px] font-bold text-warm-800 dark:text-warm-100">Focus Timer</h1>
          <span className="w-9 h-9 flex items-center justify-center text-forest-500 dark:text-forest-400" aria-hidden="true">
            <Leaf className="w-5 h-5" />
          </span>
        </div>

        {/* Mascot with speech bubble */}
        <div className="relative mx-auto mt-2 w-[200px]">
          <img
            src={ART.focusMascot}
            alt="Mascot working on a laptop"
            className="w-[200px] h-auto rounded-3xl object-cover select-none"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 72% 72% at 50% 50%, #000 62%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 72% 72% at 50% 50%, #000 62%, transparent 100%)',
            }}
          />
          <div
            key={bubbleTitle}
            className="absolute -top-1 -right-16 animate-pop-in bg-white dark:bg-warm-800 rounded-2xl rounded-bl-md px-3 py-2 shadow-soft border border-warm-200/70 dark:border-warm-700 text-left"
          >
            <strong className="block text-[13px] font-bold text-warm-800 dark:text-warm-100 leading-tight">
              {bubbleTitle}
            </strong>
            <span className="block text-[11px] text-warm-500 dark:text-warm-400 leading-tight mt-0.5">
              {bubbleSub}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 flex flex-col items-center space-y-5">
        {/* Progress ring */}
        <div className="relative mt-2 select-none" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="focusRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0B84A" />
                <stop offset="100%" stopColor="#8FB085" />
              </linearGradient>
            </defs>
            <circle
              cx={center}
              cy={center}
              r={radius}
              className="stroke-[#EDE1CB] dark:stroke-warm-800"
              strokeWidth={stroke}
              fill="transparent"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#focusRingGradient)"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(-90 ${center} ${center})`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[48px] leading-none font-extrabold tabular-nums tracking-tight text-warm-800 dark:text-warm-100">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-medium text-warm-500 dark:text-warm-400 mt-2">{MODE_LABEL[mode]}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center gap-3">
          <button
            onClick={handleReset}
            className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-white/80 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-warm-700 dark:text-warm-200 active:scale-95 transition"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleTogglePlay}
            className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2"
            aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> {isPaused ? 'Resume' : 'Start'}
              </>
            )}
          </button>
          <button
            onClick={() => handleSwitchMode(mode === 'focus' ? 'rest' : 'focus')}
            className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-white/80 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-warm-700 dark:text-warm-200 active:scale-95 transition"
            title="Skip to next session"
            aria-label="Skip to next session"
          >
            <FastForward className="w-5 h-5" />
          </button>
        </div>

        {/* Mode cards */}
        <div className="w-full grid grid-cols-3 gap-3">
          {modeCards.map(({ key, label, mins }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                onClick={() => handleSwitchMode(key)}
                className={`card py-3 px-2 flex flex-col items-center transition-all ${
                  active ? '!bg-white dark:!bg-warm-800 ring-2 ring-focus-500 text-focus-600 dark:text-focus-400' : ''
                }`}
                aria-pressed={active}
              >
                <span
                  className={`text-[13px] font-bold ${active ? 'text-focus-600 dark:text-focus-400' : 'text-warm-800 dark:text-warm-100'}`}
                >
                  {label}
                </span>
                <span
                  className={`text-xs mt-0.5 ${active ? 'text-focus-500 dark:text-focus-400' : 'text-warm-500 dark:text-warm-400'}`}
                >
                  {mins} min
                </span>
              </button>
            );
          })}
        </div>

        {/* Today's stats */}
        <div className="w-full card p-4 flex items-center justify-around">
          <div className="text-center flex-1 border-r border-warm-200 dark:border-warm-700 pr-2">
            <span className="text-[11px] font-semibold text-warm-500 uppercase tracking-wider block">Session Time</span>
            <span className="text-xl font-extrabold tabular-nums text-warm-800 dark:text-warm-100 mt-0.5 block">
              {formatTime(totalDuration - timeLeft)}
            </span>
            <span className="text-[11px] text-warm-500 dark:text-warm-400 block mt-0.5">
              Target: {formatTime(totalDuration)}
            </span>
          </div>
          <div className="text-center flex-1 pl-2">
            <span className="text-[11px] font-semibold text-warm-500 uppercase tracking-wider block">Total Today</span>
            <span className="text-xl font-extrabold tabular-nums text-focus-600 dark:text-focus-400 mt-0.5 block">
              {totalFocusMinutes}m
            </span>
            <span className="text-[11px] text-warm-500 dark:text-warm-400 block mt-0.5">
              {completedToday} {completedToday === 1 ? 'session' : 'sessions'} complete
            </span>
          </div>
        </div>

        {/* Daily milestone streaks */}
        <div className="w-full card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={20} weight="fill" className="text-honey-500" />
            <span className="text-xs font-bold text-warm-800 dark:text-warm-100">Daily Milestone Streaks</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((sessionNum) => {
              const isUnlocked = completedToday >= sessionNum;
              return (
                <div
                  key={sessionNum}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isUnlocked
                      ? 'bg-focus-600 text-honey-300 shadow-xs'
                      : 'bg-warm-200/60 dark:bg-warm-800 text-warm-400'
                  }`}
                >
                  <Flame size={14} weight={isUnlocked ? 'fill' : 'regular'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Celebration Notice */}
        {showCelebration && (
          <div className="w-full card-forest p-3.5 rounded-2xl flex items-center justify-between text-xs animate-pop-in">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-forest-400 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-xs">Great job! 25-minute focus session complete!</strong>
                <span className="text-[11px] opacity-80">Enjoy your 5-minute rest.</span>
              </div>
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="text-[11px] font-bold hover:underline px-2 py-1"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
