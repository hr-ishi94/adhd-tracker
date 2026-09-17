import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PomodoroStats } from '../types';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';
import { Brain, Coffee, Trophy, Flame } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { soundPlayer } from '../lib/audio';

interface PomodoroScreenProps {
  pomodoroStats?: PomodoroStats;
  onSessionCompleted: () => void;
}

type TimerMode = 'focus' | 'rest';

export const PomodoroScreen: React.FC<PomodoroScreenProps> = ({
  pomodoroStats,
  onSessionCompleted,
}) => {
  const FOCUS_SECONDS = 25 * 60;
  const REST_SECONDS = 5 * 60;

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const totalDuration = mode === 'focus' ? FOCUS_SECONDS : REST_SECONDS;
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
          colors: ['#5C2454', '#F5B700', '#90487B', '#FBBF24'],
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
  }, [mode, onSessionCompleted, REST_SECONDS, FOCUS_SECONDS]);

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
    setTimeLeft(mode === 'focus' ? FOCUS_SECONDS : REST_SECONDS);
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_SECONDS : REST_SECONDS);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // SVG Chronograph dial configuration
  const cx = 140;
  const cy = 140;
  const outerNumberRadius = 118;
  const tickOuterRadius = 104;
  const progressRadius = 88;
  const innerCoreRadius = 76;
  const circumference = 2 * Math.PI * progressRadius;
  const progressRatio = Math.max(0, Math.min(1, (totalDuration - timeLeft) / totalDuration));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const completedToday = pomodoroStats?.todayCompleted || 0;
  const totalFocusMinutes = completedToday * 25;

  // Generate 60 minute ticks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const len = isMajor ? 7 : 4;
    const x1 = cx + tickOuterRadius * Math.cos(angle);
    const y1 = cy + tickOuterRadius * Math.sin(angle);
    const x2 = cx + (tickOuterRadius - len) * Math.cos(angle);
    const y2 = cy + (tickOuterRadius - len) * Math.sin(angle);
    return { x1, y1, x2, y2, isMajor, i };
  });

  // 12 hour dial numbers (12, 1, 2, ... 11)
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
    const angle = (num * 30 - 90) * (Math.PI / 180);
    const x = cx + outerNumberRadius * Math.cos(angle);
    const y = cy + outerNumberRadius * Math.sin(angle);
    return { num, x, y };
  });

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-28 safe-top flex flex-col items-center justify-between text-center space-y-4">
      {/* Top Header & Capsule Mode Switcher matching reference photo */}
      <div className="w-full flex items-center justify-between pt-1">
        <div className="text-left">
          <span className="text-[11px] font-black uppercase tracking-wider text-focus-600 dark:text-focus-400 block">
            Pomo-Dino Focus
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-warm-900 dark:text-warm-100">
            Session
          </h1>
        </div>

        {/* Capsule switcher with glass styling */}
        <div className="flex p-1 bg-white/70 dark:bg-warm-850/80 backdrop-blur-xl border border-white/60 dark:border-warm-800 rounded-full shadow-soft">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-focus-600 text-white shadow-xs scale-[1.02]'
                : 'text-warm-600 dark:text-warm-400 hover:text-warm-900'
            }`}
          >
            <Brain size={14} weight="fill" />
            <span>25m Focus</span>
          </button>
          <button
            onClick={() => handleSwitchMode('rest')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              mode === 'rest'
                ? 'bg-leaf-600 text-white shadow-xs scale-[1.02]'
                : 'text-warm-600 dark:text-warm-400 hover:text-warm-900'
            }`}
          >
            <Coffee size={14} weight="fill" />
            <span>5m Rest</span>
          </button>
        </div>
      </div>

      {/* Chronograph Watch Dial (Faithfully modeled after the phone in the reference image) */}
      <div className="relative flex items-center justify-center my-1 select-none">
        <svg className="w-72 h-72 sm:w-80 sm:h-80" viewBox="0 0 280 280">
          {/* Dial Outer Bezel Track */}
          <circle
            cx={cx}
            cy={cy}
            r={outerNumberRadius + 14}
            className="fill-white/60 dark:fill-warm-900/60 stroke-warm-200/80 dark:stroke-warm-800"
            strokeWidth="1.5"
          />

          {/* Hour Numbers around perimeter (12, 1, 2, ... 11) */}
          {hourNumbers.map(({ num, x, y }) => (
            <text
              key={num}
              x={x}
              y={y + 4}
              textAnchor="middle"
              className="text-[11px] font-bold fill-warm-500 dark:fill-warm-400 select-none font-mono"
            >
              {num}
            </text>
          ))}

          {/* 60 Minute/Second Fine Radial Ticks */}
          {ticks.map(({ x1, y1, x2, y2, isMajor, i }) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={
                isMajor
                  ? 'stroke-warm-700 dark:stroke-warm-300 stroke-[1.5]'
                  : 'stroke-warm-300 dark:stroke-warm-700 stroke-[1]'
              }
            />
          ))}

          {/* Background Progress Track */}
          <circle
            cx={cx}
            cy={cy}
            r={progressRadius}
            className="stroke-warm-200/80 dark:stroke-warm-800"
            strokeWidth="8"
            fill="transparent"
          />

          {/* Active Elapsed Arc with High-Contrast Dark/Colored Cap like reference image */}
          <circle
            cx={cx}
            cy={cy}
            r={progressRadius}
            className={`transition-all duration-1000 ease-linear ${
              mode === 'focus' ? 'stroke-warm-950 dark:stroke-focus-400' : 'stroke-leaf-600'
            }`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${cx} ${cy})`}
          />

          {/* Inner Radiant Core Disc (Rich Deep Plum with ambient glow) */}
          <defs>
            <radialGradient id="plumCoreGradient" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#7E3273" />
              <stop offset="45%" stopColor="#5C2454" />
              <stop offset="100%" stopColor="#3C1536" />
            </radialGradient>
            <radialGradient id="leafCoreGradient" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#6fb260" />
              <stop offset="45%" stopColor="#407835" />
              <stop offset="100%" stopColor="#2c5324" />
            </radialGradient>
            <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#5C2454" floodOpacity="0.4" />
            </filter>
          </defs>

          <circle
            cx={cx}
            cy={cy}
            r={innerCoreRadius}
            fill={mode === 'focus' ? 'url(#plumCoreGradient)' : 'url(#leafCoreGradient)'}
            filter="url(#coreGlow)"
          />
        </svg>

        {/* Center Digital Countdown Digits (Matching 03:53:18 in reference photo) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          {/* Subtle brand mascot */}
          <div className="w-10 h-10 rounded-full p-0.5 bg-white/20 backdrop-blur-xs mb-0.5 overflow-hidden shadow-xs">
            <img
              src="/pomo-dino.png"
              alt="Pomo Dino"
              className={`w-full h-full object-contain ${isRunning ? 'animate-pulse' : ''}`}
            />
          </div>

          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-md">
            {formatTime(timeLeft)}
          </span>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/85 mt-0.5 px-2 py-0.5 rounded-full bg-black/15">
            {isRunning ? (mode === 'focus' ? 'Focusing' : 'Resting') : 'Ready'}
          </span>
        </div>
      </div>

      {/* Active Task Title (Like "First Screen Design" in the reference image) */}
      <div className="text-center space-y-0.5">
        <h2 className="text-lg sm:text-xl font-black text-warm-900 dark:text-warm-100 tracking-tight">
          {mode === 'focus' ? 'Deep Work & Learning Sprint' : 'Rest & Recharge Break'}
        </h2>
        <p className="text-xs text-warm-500 dark:text-warm-400 font-medium">
          {mode === 'focus' ? 'Single-task clarity • Dopamine preserved' : 'Step away from screen • Drink water'}
        </p>
      </div>

      {/* Dual Column Time Metrics (Faithfully matching "Lap Time" & "Total Time" from image) */}
      <div className="w-full glass-card rounded-3xl p-4 flex items-center justify-around border border-white/60 dark:border-white/10 shadow-soft">
        <div className="text-center flex-1 border-r border-warm-200/80 dark:border-warm-800 pr-2">
          <span className="text-[11px] font-bold text-warm-500 uppercase tracking-wider block">
            Session Time
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-warm-900 dark:text-warm-100 mt-0.5 block">
            {formatTime(totalDuration - timeLeft)}
          </span>
          <span className="text-[11px] font-semibold text-warm-400 dark:text-warm-500 block mt-0.5">
            Target: {mode === 'focus' ? '25:00' : '05:00'}
          </span>
        </div>

        <div className="text-center flex-1 pl-2">
          <span className="text-[11px] font-bold text-warm-500 uppercase tracking-wider block">
            Total Today
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-focus-600 dark:text-focus-400 mt-0.5 block">
            {totalFocusMinutes}m
          </span>
          <span className="text-[11px] font-semibold text-warm-400 dark:text-warm-500 block mt-0.5">
            {completedToday} {completedToday === 1 ? 'session' : 'sessions'} complete
          </span>
        </div>
      </div>

      {/* Floating Glass Controls Bar (Matching trio of circular buttons in image) */}
      <div className="flex items-center justify-center gap-5 w-full pt-1">
        {/* Reset circular glass button */}
        <button
          onClick={handleReset}
          className="glass-btn-circle w-12 h-12 rounded-full flex items-center justify-center text-warm-700 dark:text-warm-200"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Center Primary Action Button (White circular hero button with crisp ring) */}
        <button
          onClick={handleTogglePlay}
          className="hero-dial-button w-16 h-16 rounded-full flex items-center justify-center text-focus-600"
          aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </button>

        {/* Skip to Next Session circular glass button */}
        <button
          onClick={() => handleSwitchMode(mode === 'focus' ? 'rest' : 'focus')}
          className="glass-btn-circle w-12 h-12 rounded-full flex items-center justify-center text-warm-700 dark:text-warm-200"
          title="Skip to next session"
          aria-label="Skip to next session"
        >
          <FastForward className="w-5 h-5" />
        </button>
      </div>

      {/* Achievement Badges in frosted card */}
      <div className="w-full glass-card-warm rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={20} weight="fill" className="text-amber-500" />
          <span className="text-xs font-black text-warm-900 dark:text-warm-100">
            Daily Milestone Streaks
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((sessionNum) => {
            const isUnlocked = completedToday >= sessionNum;
            return (
              <div
                key={sessionNum}
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                  isUnlocked
                    ? 'bg-focus-600 text-amber-300 shadow-xs ring-1 ring-amber-400/40'
                    : 'bg-warm-200/60 dark:bg-warm-800 text-warm-400'
                }`}
              >
                <Flame size={14} weight={isUnlocked ? 'fill' : 'regular'} className={isUnlocked ? 'text-amber-400' : ''} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebration Notice */}
      {showCelebration && (
        <div className="w-full p-3.5 rounded-2xl bg-leaf-50 dark:bg-leaf-950/50 border border-leaf-300 dark:border-leaf-800 flex items-center justify-between text-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-full bg-leaf-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-leaf-900 dark:text-leaf-200 block text-xs">
                Great job! 25-minute focus session complete!
              </strong>
              <span className="text-leaf-700 dark:text-leaf-400 text-[11px]">
                Enjoy your 5-minute rest.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="text-[11px] font-bold text-leaf-800 dark:text-leaf-300 hover:underline px-2 py-1"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
