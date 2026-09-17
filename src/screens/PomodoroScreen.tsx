import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Sprint, PomodoroStats } from '../types';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, Sparkles, BookOpen, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundPlayer } from '../lib/audio';

interface PomodoroScreenProps {
  sprints: Sprint[];
  pomodoroStats?: PomodoroStats;
  onSessionCompleted: () => void;
  initialTopic?: string;
}

type TimerMode = 'focus' | 'rest';

export const PomodoroScreen: React.FC<PomodoroScreenProps> = ({
  sprints,
  pomodoroStats,
  onSessionCompleted,
  initialTopic = '',
}) => {
  const FOCUS_SECONDS = 25 * 60;
  const REST_SECONDS = 5 * 60;

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || (sprints.find(s => s.status === 'active')?.name || 'General Learning'));
  const [customTopic, setCustomTopic] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const totalDuration = mode === 'focus' ? FOCUS_SECONDS : REST_SECONDS;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
    }
  }, [initialTopic]);

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
        // Confetti fallback
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
  }, [isRunning, mode, handleTimerComplete]);

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

  const currentTopicDisplay = customTopic.trim() || selectedTopic;

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-4">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-focus-600" />
          <span>Pomo-Dino Learning Sprint</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-warm-900 dark:text-warm-100">
          {mode === 'focus' ? '25 Min Focus Sprint' : '5 Min Rest & Recharge'}
        </h1>
        <p className="text-xs text-warm-500 dark:text-warm-400">
          {mode === 'focus' 
            ? 'One single task. No panic, no multitasking.' 
            : 'Step away from the screen, stretch, drink water!'}
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex p-1.5 bg-warm-200/60 dark:bg-warm-850 rounded-2xl">
        <button
          onClick={() => handleSwitchMode('focus')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'focus'
              ? 'bg-white dark:bg-warm-800 text-focus-600 dark:text-focus-400 shadow-sm'
              : 'text-warm-600 dark:text-warm-400 hover:text-warm-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>25m Study</span>
        </button>
        <button
          onClick={() => handleSwitchMode('rest')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'rest'
              ? 'bg-white dark:bg-warm-800 text-leaf-600 dark:text-leaf-400 shadow-sm'
              : 'text-warm-600 dark:text-warm-400 hover:text-warm-900'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>5m Rest</span>
        </button>
      </div>

      {/* Circular Timer Display with Pomo-Dino inside */}
      <div className="relative flex items-center justify-center py-2">
        <svg className="w-72 h-72 transform -rotate-90" viewBox="0 0 240 240">
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
          {/* Cute Pomo-Dino Logo Mascot */}
          <div className="w-18 h-18 rounded-full p-1 bg-white/90 dark:bg-warm-800/90 shadow-soft backdrop-blur-sm mb-1 overflow-hidden">
            <img
              src="/pomo-dino.png"
              alt="Pomo Dino"
              className={`w-full h-full object-contain ${isRunning ? 'animate-pulse' : ''}`}
            />
          </div>

          <span className="text-5xl font-black font-mono tracking-tight text-warm-900 dark:text-warm-100">
            {formatTime(timeLeft)}
          </span>

          <span className={`text-xs font-bold mt-1 px-3 py-1 rounded-full ${
            mode === 'focus'
              ? 'bg-focus-100 text-focus-700 dark:bg-focus-900/60 dark:text-focus-300'
              : 'bg-leaf-100 text-leaf-700 dark:bg-leaf-900/60 dark:text-leaf-300'
          }`}>
            {isRunning ? (mode === 'focus' ? 'Focusing...' : 'Resting...') : 'Paused'}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="p-3.5 rounded-2xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-all shadow-sm"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={handleTogglePlay}
          className={`px-10 py-4 rounded-2xl font-black text-white shadow-lifted flex items-center gap-3 transition-all transform active:scale-95 ${
            mode === 'focus'
              ? 'bg-focus-600 hover:bg-focus-700'
              : 'bg-leaf-600 hover:bg-leaf-700'
          }`}
          aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span className="text-base">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current ml-0.5" />
              <span className="text-base">Start {mode === 'focus' ? 'Focus' : 'Rest'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleSwitchMode(mode === 'focus' ? 'rest' : 'focus')}
          className="p-3.5 rounded-2xl bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-all shadow-sm"
          title="Skip to next session"
          aria-label="Skip to next session"
        >
          <FastForward className="w-6 h-6" />
        </button>
      </div>

      {/* Topic & Learning Sprint Linker */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-focus-600" />
            <span>Learning Focus Topic</span>
          </label>
          {pomodoroStats && (
            <span className="text-xs font-bold text-warm-500">
              Today: <strong className="text-focus-600">{pomodoroStats.todayCompleted}</strong> 🍅
            </span>
          )}
        </div>

        {sprints.length > 0 && (
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setCustomTopic('');
            }}
            className="w-full text-sm font-medium bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-2.5 text-warm-800 dark:text-warm-200 focus:outline-none focus:ring-2 focus:ring-focus-500"
          >
            {sprints.map((s) => (
              <option key={s.id} value={s.name}>
                {s.status === 'active' ? '🟢 Active: ' : ''}{s.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Or write custom goal (e.g. Solve 2 LeetCode problems)..."
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          className="w-full text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-2.5 text-warm-800 dark:text-warm-200 focus:outline-none focus:ring-2 focus:ring-focus-500"
        />

        {currentTopicDisplay && (
          <div className="pt-1 text-xs text-warm-600 dark:text-warm-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-focus-500 shrink-0"></span>
            <span className="truncate">Current Target: <strong>{currentTopicDisplay}</strong></span>
          </div>
        )}
      </div>

      {/* Celebration Modal / Banner */}
      {showCelebration && (
        <div className="p-3.5 rounded-2xl bg-leaf-50 dark:bg-leaf-950/50 border border-leaf-300 dark:border-leaf-800 flex items-center justify-between text-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-leaf-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-leaf-900 dark:text-leaf-200 block text-xs">
                Amazing Job! 25-minute Sprint Finished 🎉
              </strong>
              <span className="text-leaf-700 dark:text-leaf-400 text-[11px]">
                Your 5-minute rest timer is ready. Relax your eyes!
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="text-[11px] font-bold text-leaf-800 dark:text-leaf-300 hover:underline px-2 py-1"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
};
