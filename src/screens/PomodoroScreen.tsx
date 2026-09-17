import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PomodoroStats } from '../types';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';
import { Brain, Coffee, Trophy, Sparkle, Fire, Flame } from '@phosphor-icons/react';
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
          colors: ['#f26543', '#549646', '#ffd3c2', '#ffd700'],
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

  // SVG Circular progress math
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, (totalDuration - timeLeft) / totalDuration));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const completedToday = pomodoroStats?.todayCompleted || 0;

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-24 safe-top flex flex-col items-center justify-center text-center space-y-5">
      {/* Clean Centered Header: Chip and sub-descriptions removed */}
      <div className="w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-warm-900 dark:text-warm-100">
          {mode === 'focus' ? '25 Min Focus' : '5 Min Rest'}
        </h1>
      </div>

      {/* Mode Selector Tabs with Attractive Phosphor Icons */}
      <div className="w-full flex p-1.5 bg-warm-200/60 dark:bg-warm-850 rounded-2xl max-w-xs mx-auto shadow-inner">
        <button
          onClick={() => handleSwitchMode('focus')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            mode === 'focus'
              ? 'bg-white dark:bg-warm-800 text-focus-600 dark:text-focus-400 shadow-sm scale-[1.02]'
              : 'text-warm-600 dark:text-warm-400 hover:text-warm-900'
          }`}
        >
          <Brain size={20} weight="fill" className="text-focus-600 dark:text-focus-400" />
          <span>25m Focus</span>
        </button>
        <button
          onClick={() => handleSwitchMode('rest')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            mode === 'rest'
              ? 'bg-white dark:bg-warm-800 text-leaf-600 dark:text-leaf-400 shadow-sm scale-[1.02]'
              : 'text-warm-600 dark:text-warm-400 hover:text-warm-900'
          }`}
        >
          <Coffee size={20} weight="fill" className="text-leaf-600 dark:text-leaf-400" />
          <span>5m Rest</span>
        </button>
      </div>

      {/* Circular Timer Display with Pomo-Dino */}
      <div className="relative flex items-center justify-center py-2">
        <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90" viewBox="0 0 240 240">
          {/* Background Track */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            className="stroke-warm-200 dark:stroke-warm-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            className={`transition-all duration-1000 ease-linear ${
              mode === 'focus' ? 'stroke-focus-600' : 'stroke-leaf-500'
            }`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-white/95 dark:bg-warm-800/95 shadow-soft backdrop-blur-sm mb-1 overflow-hidden">
            <img
              src="/pomo-dino.png"
              alt="Pomo Dino"
              className={`w-full h-full object-contain ${isRunning ? 'animate-pulse' : ''}`}
            />
          </div>

          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-warm-900 dark:text-warm-100">
            {formatTime(timeLeft)}
          </span>

          <span className={`text-xs font-bold mt-1 px-3 py-0.5 rounded-full ${
            mode === 'focus'
              ? 'bg-focus-100 text-focus-700 dark:bg-focus-900/60 dark:text-focus-300'
              : 'bg-leaf-100 text-leaf-700 dark:bg-leaf-900/60 dark:text-leaf-300'
          }`}>
            {isRunning ? (mode === 'focus' ? 'Deep Focus...' : 'Resting...') : 'Ready'}
          </span>
        </div>
      </div>

      {/* Centered Timer Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
        <button
          onClick={handleReset}
          className="p-3.5 sm:p-4 rounded-2xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-all shadow-sm active:scale-95"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleTogglePlay}
          className={`px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-white shadow-lifted flex items-center justify-center gap-2.5 transition-all transform active:scale-95 ${
            mode === 'focus'
              ? 'bg-focus-600 hover:bg-focus-700'
              : 'bg-leaf-600 hover:bg-leaf-700'
          }`}
          aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span className="text-base sm:text-lg">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
              <span className="text-base sm:text-lg">Start {mode === 'focus' ? 'Focus' : 'Rest'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleSwitchMode(mode === 'focus' ? 'rest' : 'focus')}
          className="p-3.5 sm:p-4 rounded-2xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-all shadow-sm active:scale-95"
          title="Skip to next session"
          aria-label="Skip to next session"
        >
          <FastForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Attractive Centered Session Rewards Card */}
      <div className="w-full max-w-sm mx-auto bg-gradient-to-r from-focus-50 via-warm-50 to-amber-50 dark:from-warm-850 dark:to-warm-900 rounded-3xl p-4 border border-focus-200/90 dark:border-focus-800/80 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-2xl bg-focus-100 dark:bg-focus-950/80 text-focus-600 dark:text-focus-400 flex items-center justify-center shadow-xs">
              <Trophy size={24} weight="fill" className="text-focus-600 dark:text-focus-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-warm-500 uppercase tracking-wider">
                  Today's Rewards
                </span>
                <Sparkle size={13} weight="fill" className="text-amber-500 animate-pulse" />
              </div>
              <p className="text-base font-black text-warm-900 dark:text-warm-100">
                {completedToday} {completedToday === 1 ? 'Focus Session' : 'Focus Sessions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-warm-800 px-3 py-1.5 rounded-2xl border border-warm-200/80 dark:border-warm-700 shadow-xs">
            <Fire size={18} weight="fill" className="text-focus-600" />
            <span className="text-xs font-black text-warm-900 dark:text-warm-100">
              {completedToday * 25}m
            </span>
          </div>
        </div>

        {/* Visual Achievement Badges based on completed sessions */}
        <div className="mt-3 pt-3 border-t border-focus-200/60 dark:border-warm-800 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((sessionNum) => {
            const isUnlocked = completedToday >= sessionNum;
            return (
              <div
                key={sessionNum}
                className={`flex-1 py-1 px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] font-black transition-all ${
                  isUnlocked
                    ? 'bg-focus-600 text-white shadow-xs'
                    : 'bg-warm-100 dark:bg-warm-800 text-warm-400 dark:text-warm-600'
                }`}
              >
                <Flame size={13} weight={isUnlocked ? 'fill' : 'regular'} />
                <span>#{sessionNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebration Notice */}
      {showCelebration && (
        <div className="w-full max-w-sm mx-auto p-3.5 rounded-2xl bg-leaf-50 dark:bg-leaf-950/50 border border-leaf-300 dark:border-leaf-800 flex items-center justify-between text-xs animate-in fade-in zoom-in-95">
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
