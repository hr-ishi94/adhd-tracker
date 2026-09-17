import React, { useState, useEffect } from 'react';
import type { HabitQuitTracker, HabitMilestone } from '../types';
import { HABIT_MILESTONES } from '../lib/storage';
import { 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  X, 
  HeartHandshake
} from 'lucide-react';
import { 
  Plant,
  Waves,
  Wind,
  Sun,
  Trophy,
  Lightning,
  ShieldStar,
  Diamond,
  RocketLaunch,
  Crown,
  Brain,
  MedalMilitary,
  Lock,
  CheckCircle
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { soundPlayer } from '../lib/audio';

interface HabitBreakerScreenProps {
  trackers: HabitQuitTracker[];
  onUpdateTrackers: (updated: HabitQuitTracker[]) => void;
}

// Phosphor Icon renderer for each milestone
export function getMilestonePhosphorIcon(milestoneId: string, isUnlocked: boolean, size = 26) {
  const weight = isUnlocked ? 'fill' : 'regular';
  const colorClass = isUnlocked ? '' : 'text-warm-400 dark:text-warm-600';

  switch (milestoneId) {
    case 'm-2h':
      return <Plant size={size} weight={weight} className={isUnlocked ? 'text-emerald-500' : colorClass} />;
    case 'm-4h':
      return <Waves size={size} weight={weight} className={isUnlocked ? 'text-sky-500' : colorClass} />;
    case 'm-8h':
      return <Wind size={size} weight={weight} className={isUnlocked ? 'text-teal-500' : colorClass} />;
    case 'm-12h':
      return <Sun size={size} weight={weight} className={isUnlocked ? 'text-amber-500' : colorClass} />;
    case 'm-24h':
      return <Trophy size={size} weight={weight} className={isUnlocked ? 'text-amber-400' : colorClass} />;
    case 'm-48h':
      return <Flame size={size} className={isUnlocked ? 'text-orange-500 fill-orange-500' : colorClass} />;
    case 'm-3d':
      return <Lightning size={size} weight={weight} className={isUnlocked ? 'text-yellow-400' : colorClass} />;
    case 'm-5d':
      return <ShieldStar size={size} weight={weight} className={isUnlocked ? 'text-blue-500' : colorClass} />;
    case 'm-7d':
      return <Diamond size={size} weight={weight} className={isUnlocked ? 'text-cyan-400' : colorClass} />;
    case 'm-10d':
      return <RocketLaunch size={size} weight={weight} className={isUnlocked ? 'text-indigo-500' : colorClass} />;
    case 'm-14d':
      return <Crown size={size} weight={weight} className={isUnlocked ? 'text-purple-500' : colorClass} />;
    case 'm-21d':
      return <Brain size={size} weight={weight} className={isUnlocked ? 'text-pink-500' : colorClass} />;
    case 'm-30d':
      return <MedalMilitary size={size} weight={weight} className={isUnlocked ? 'text-focus-600' : colorClass} />;
    default:
      return <Trophy size={size} weight={weight} className={isUnlocked ? 'text-focus-600' : colorClass} />;
  }
}

export const HabitBreakerScreen: React.FC<HabitBreakerScreenProps> = ({
  trackers,
  onUpdateTrackers,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(trackers[0]?.id || null);

  // New Habit Modal
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitReason, setNewHabitReason] = useState('');

  // Rewards Dialog (Modal View with Grid)
  const [isRewardsDialogOpen, setIsRewardsDialogOpen] = useState(false);

  // Reset Confirmation Modal
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);

  // Milestone Detail Modal
  const [selectedMilestone, setSelectedMilestone] = useState<HabitMilestone | null>(null);

  // Craving SOS 3-Minute Breathing tool
  const [isCravingSosOpen, setIsCravingSosOpen] = useState(false);
  const [activeSosHabitId, setActiveSosHabitId] = useState<string | null>(null);
  const [sosSecondsLeft, setSosSecondsLeft] = useState(180);
  const [sosPhase, setSosPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for newly unlocked milestones across all habits
  useEffect(() => {
    let hasChanges = false;
    const updatedTrackers = trackers.map((tracker) => {
      const quitTime = new Date(tracker.quitDate).getTime();
      const elapsedHours = Math.max(0, (now.getTime() - quitTime) / (1000 * 60 * 60));
      const newlyUnlocked: string[] = [];

      HABIT_MILESTONES.forEach((m) => {
        if (elapsedHours >= m.hours && !tracker.unlockedMilestones.includes(m.id)) {
          newlyUnlocked.push(m.id);
        }
      });

      if (newlyUnlocked.length > 0) {
        hasChanges = true;
        soundPlayer.playMilestoneCelebration();
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#f26543', '#549646'],
          });
        } catch {
          // fallback
        }
        return {
          ...tracker,
          unlockedMilestones: [...tracker.unlockedMilestones, ...newlyUnlocked],
        };
      }
      return tracker;
    });

    if (hasChanges) {
      onUpdateTrackers(updatedTrackers);
    }
  }, [now, trackers, onUpdateTrackers]);

  const handleIncrementCraving = (habitId: string) => {
    const updated = trackers.map((t) =>
      t.id === habitId ? { ...t, cravingsResisted: t.cravingsResisted + 1 } : t
    );
    onUpdateTrackers(updated);
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#549646', '#ffd700'],
      });
    } catch {
      // fallback
    }
  };

  // Craving SOS 3-Minute Breathing cycle
  useEffect(() => {
    if (!isCravingSosOpen) return;
    const interval = setInterval(() => {
      setSosSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsCravingSosOpen(false);
          // Reward craving resisted on completion
          if (activeSosHabitId) {
            handleIncrementCraving(activeSosHabitId);
          }
          return 180;
        }
        const cycleSecond = (180 - prev) % 16;
        if (cycleSecond < 4) setSosPhase('Inhale');
        else if (cycleSecond < 8) setSosPhase('Hold');
        else if (cycleSecond < 12) setSosPhase('Exhale');
        else setSosPhase('Rest');

        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCravingSosOpen, activeSosHabitId]);

  const handleConfirmReset = () => {
    if (!resetTargetId) return;
    const updated = trackers.map((t) => {
      if (t.id !== resetTargetId) return t;
      return {
        ...t,
        quitDate: new Date().toISOString(),
        resetsCount: t.resetsCount + 1,
        unlockedMilestones: [],
      };
    });
    onUpdateTrackers(updated);
    setResetTargetId(null);
  };

  const handleAddNewHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: HabitQuitTracker = {
      id: `habit-${Date.now()}`,
      habitName: newHabitName.trim(),
      reason: newHabitReason.trim() || 'To protect my energy, focus, and dopamine baseline.',
      quitDate: new Date().toISOString(),
      resetsCount: 0,
      cravingsResisted: 0,
      unlockedMilestones: [],
    };

    onUpdateTrackers([...trackers, newHabit]);
    setExpandedHabitId(newHabit.id);
    setNewHabitName('');
    setNewHabitReason('');
    setIsAddingHabit(false);
  };

  const handleDeleteHabit = (habitId: string) => {
    const updated = trackers.filter((t) => t.id !== habitId);
    onUpdateTrackers(updated);
    if (expandedHabitId === habitId) {
      setExpandedHabitId(updated[0]?.id || null);
    }
  };

  const openSosModal = (habitId: string) => {
    setActiveSosHabitId(habitId);
    setSosSecondsLeft(180);
    setSosPhase('Inhale');
    setIsCravingSosOpen(true);
  };

  // Count total distinct milestones unlocked across habits
  const unlockedMilestonesSet = new Set(trackers.flatMap((t) => t.unlockedMilestones));
  const totalUnlockedCount = HABIT_MILESTONES.filter((m) => unlockedMilestonesSet.has(m.id)).length;

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-focus-600" />
            <span>Habit Freedom & Dopamine Reset</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-warm-900 dark:text-warm-100 mt-1">
            Bad Habits Breaker
          </h1>
        </div>

        <button
          onClick={() => setIsAddingHabit(true)}
          className="px-3 py-2 rounded-xl bg-focus-600 hover:bg-focus-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Rewards Section Trigger Banner (Opens separate Dialog View) */}
      <button
        onClick={() => setIsRewardsDialogOpen(true)}
        className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-warm-50 to-focus-50 dark:from-warm-850 dark:to-warm-900 border border-amber-200/90 dark:border-warm-700 shadow-soft flex items-center justify-between hover:border-amber-400 transition-all active:scale-[0.99] group text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <Trophy size={22} weight="fill" className="text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-black text-warm-900 dark:text-warm-100">
                Unlockable Achievements
              </h2>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                {totalUnlockedCount}/{HABIT_MILESTONES.length}
              </span>
            </div>
            <p className="text-[11px] text-warm-500 font-medium mt-0.5">
              Tap to view dopamine & recovery reward milestones
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-focus-600 dark:text-focus-400 group-hover:translate-x-0.5 transition-transform shrink-0 pl-2">
          View Grid →
        </span>
      </button>

      {/* Main Content: Only show created habit cards, or show create button if empty */}
      {trackers.length === 0 ? (
        <div className="text-center py-10 px-4 bg-white dark:bg-warm-850 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-focus-100 dark:bg-focus-950 text-focus-600 dark:text-focus-400 flex items-center justify-center shadow-xs">
            <Trophy size={32} weight="fill" className="text-focus-600" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h2 className="text-lg font-black text-warm-900 dark:text-warm-100">
              No Habits Being Tracked
            </h2>
            <p className="text-xs text-warm-500">
              Break bad habits like doomscrolling or procrastination. Earn milestones as your dopamine resets.
            </p>
          </div>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="px-6 py-3 rounded-2xl bg-focus-600 hover:bg-focus-700 text-white font-bold text-sm shadow-lifted inline-flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Habit Tracker</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {trackers.map((tracker) => {
            const isExpanded = expandedHabitId === tracker.id;
            const quitTime = new Date(tracker.quitDate).getTime();
            const elapsedMs = Math.max(0, now.getTime() - quitTime);
            const totalSeconds = Math.floor(elapsedMs / 1000);
            const days = Math.floor(totalSeconds / (3600 * 24));
            const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            const elapsedHours = elapsedMs / (1000 * 60 * 60);

            const nextMilestone = HABIT_MILESTONES.find((m) => elapsedHours < m.hours) || null;
            const previousMilestoneHours = nextMilestone 
              ? (HABIT_MILESTONES[HABIT_MILESTONES.indexOf(nextMilestone) - 1]?.hours || 0)
              : (HABIT_MILESTONES[HABIT_MILESTONES.length - 1]?.hours || 720);

            const progressPercent = nextMilestone
              ? Math.min(100, Math.max(0, ((elapsedHours - previousMilestoneHours) / (nextMilestone.hours - previousMilestoneHours)) * 100))
              : 100;

            return (
              <div
                key={tracker.id}
                className="bg-white dark:bg-warm-850 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft overflow-hidden transition-all"
              >
                {/* Card Header (Click to dropdown/toggle) */}
                <div
                  onClick={() => setExpandedHabitId(isExpanded ? null : tracker.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-warm-50/70 dark:hover:bg-warm-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-focus-100 dark:bg-focus-950 text-focus-600 dark:text-focus-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Flame className="w-6 h-6 fill-focus-600" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-base font-black text-warm-900 dark:text-warm-100 truncate">
                        {tracker.habitName}
                      </h2>
                      <p className="text-xs font-bold text-leaf-600 dark:text-leaf-400 mt-0.5 flex items-center gap-1">
                        <span>{days > 0 ? `${days}d ` : ''}{hours}h {minutes}m Clean</span>
                        {tracker.cravingsResisted > 0 && (
                          <span className="text-warm-400 dark:text-warm-500 font-medium">
                            • {tracker.cravingsResisted} cravings resisted
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {nextMilestone && !isExpanded && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300">
                        {Math.round(progressPercent)}%
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-warm-400" /> : <ChevronDown className="w-5 h-5 text-warm-400" />}
                  </div>
                </div>

                {/* Dropdown Content */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 space-y-4 border-t border-warm-100 dark:border-warm-800">
                    {/* Live Clean Timer Grid */}
                    <div className="pt-2">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-warm-50 dark:bg-warm-900 p-2.5 rounded-2xl border border-warm-100 dark:border-warm-800">
                          <span className="block text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 font-mono">
                            {days}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-warm-500 tracking-wider">Days</span>
                        </div>
                        <div className="bg-warm-50 dark:bg-warm-900 p-2.5 rounded-2xl border border-warm-100 dark:border-warm-800">
                          <span className="block text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 font-mono">
                            {hours}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-warm-500 tracking-wider">Hours</span>
                        </div>
                        <div className="bg-warm-50 dark:bg-warm-900 p-2.5 rounded-2xl border border-warm-100 dark:border-warm-800">
                          <span className="block text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 font-mono">
                            {minutes}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-warm-500 tracking-wider">Mins</span>
                        </div>
                        <div className="bg-warm-50 dark:bg-warm-900 p-2.5 rounded-2xl border border-warm-100 dark:border-warm-800">
                          <span className="block text-2xl sm:text-3xl font-black text-focus-600 dark:text-focus-400 font-mono">
                            {seconds}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-warm-500 tracking-wider">Secs</span>
                        </div>
                      </div>
                    </div>

                    {/* Why I'm Quitting Quote */}
                    {tracker.reason && (
                      <div className="p-3 bg-warm-50 dark:bg-warm-900 rounded-2xl border border-warm-200/60 dark:border-warm-800 flex items-start gap-2.5">
                        <HeartHandshake className="w-4 h-4 text-focus-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-warm-700 dark:text-warm-300 italic leading-relaxed">
                          "{tracker.reason}"
                        </p>
                      </div>
                    )}

                    {/* Next Milestone Progress Bar with Phosphor icon */}
                    {nextMilestone && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-warm-600 dark:text-warm-300 flex items-center gap-1.5">
                            <span>Next:</span>
                            <span className="inline-flex items-center gap-1 text-focus-600 dark:text-focus-400">
                              {getMilestonePhosphorIcon(nextMilestone.id, false, 16)}
                              <strong>{nextMilestone.title}</strong>
                            </span>
                          </span>
                          <span className="text-warm-500 font-medium">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-warm-100 dark:bg-warm-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-focus-500 to-leaf-500 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Craving SOS & Resisted Buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => openSosModal(tracker.id)}
                        className="py-3 px-3 rounded-2xl bg-focus-600 hover:bg-focus-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Craving SOS (3m Breath)</span>
                      </button>

                      <button
                        onClick={() => handleIncrementCraving(tracker.id)}
                        className="py-3 px-3 rounded-2xl bg-leaf-50 hover:bg-leaf-100 dark:bg-leaf-950/60 dark:hover:bg-leaf-900/60 border border-leaf-300 dark:border-leaf-800 text-leaf-800 dark:text-leaf-300 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-leaf-600" />
                        <span>+ Resisted ({tracker.cravingsResisted})</span>
                      </button>
                    </div>

                    {/* Footer Actions: Reset Timer & Delete Habit */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => setResetTargetId(tracker.id)}
                        className="text-warm-500 hover:text-focus-600 font-bold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Streak</span>
                      </button>

                      <button
                        onClick={() => handleDeleteHabit(tracker.id)}
                        className="text-warm-400 hover:text-red-500 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Habit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SEPARATE DIALOG VIEW: UNLOCKABLE ACHIEVEMENTS (GRID VIEW WITH PHOSPHOR ICONS) */}
      {isRewardsDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-warm-850 rounded-3xl p-5 max-w-lg w-full max-h-[88vh] border border-warm-200 dark:border-warm-800 shadow-lifted flex flex-col animate-in fade-in zoom-in-95">
            {/* Dialog Header */}
            <div className="flex items-start justify-between pb-3 border-b border-warm-100 dark:border-warm-800 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Trophy size={20} weight="fill" className="text-amber-500" />
                  <h2 className="text-lg font-black text-warm-900 dark:text-warm-100">
                    Unlockable Achievements
                  </h2>
                </div>
                <p className="text-xs text-warm-500 dark:text-warm-400">
                  {totalUnlockedCount} of {HABIT_MILESTONES.length} milestones unlocked • Tap any to inspect
                </p>
              </div>
              <button
                onClick={() => setIsRewardsDialogOpen(false)}
                className="p-1.5 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                aria-label="Close rewards dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Achievement Grid View */}
            <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {HABIT_MILESTONES.map((milestone) => {
                  const isUnlocked = trackers.some((t) => t.unlockedMilestones.includes(milestone.id));

                  return (
                    <div
                      key={milestone.id}
                      onClick={() => setSelectedMilestone(milestone)}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-between gap-2 relative overflow-hidden active:scale-[0.98] ${
                        isUnlocked
                          ? 'bg-gradient-to-b from-amber-50/70 to-white dark:from-warm-800 dark:to-warm-850 border-amber-300 dark:border-amber-700/60 shadow-soft'
                          : 'bg-warm-50/50 dark:bg-warm-900/40 border-warm-200/80 dark:border-warm-800/80 opacity-75'
                      }`}
                    >
                      {/* Unlocked / Locked status indicator */}
                      <div className="absolute top-2 right-2">
                        {isUnlocked ? (
                          <CheckCircle size={15} weight="fill" className="text-emerald-500" />
                        ) : (
                          <Lock size={13} weight="bold" className="text-warm-400" />
                        )}
                      </div>

                      {/* Icon Circle */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                        isUnlocked
                          ? 'bg-amber-100/90 dark:bg-amber-950/80 shadow-xs scale-105'
                          : 'bg-warm-100 dark:bg-warm-800'
                      }`}>
                        {getMilestonePhosphorIcon(milestone.id, isUnlocked, 28)}
                      </div>

                      {/* Time and Title */}
                      <div className="w-full">
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${
                          isUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-warm-400'
                        }`}>
                          {milestone.hours < 24 ? `${milestone.hours} Hours` : `${Math.floor(milestone.hours / 24)} Days`}
                        </span>
                        <h3 className="text-xs font-bold text-warm-900 dark:text-warm-100 truncate mt-0.5">
                          {milestone.rewardDescription}
                        </h3>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-warm-100 dark:bg-warm-800 text-warm-500'
                      }`}>
                        {isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="pt-3 border-t border-warm-100 dark:border-warm-800 shrink-0">
              <button
                onClick={() => setIsRewardsDialogOpen(false)}
                className="w-full py-3 rounded-2xl bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 font-bold text-xs hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors"
              >
                Close Achievements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW BAD HABIT */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-warm-850 rounded-3xl p-5 max-w-sm w-full border border-warm-200 dark:border-warm-800 shadow-lifted space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-warm-900 dark:text-warm-100">
                Track New Bad Habit
              </h2>
              <button
                onClick={() => setIsAddingHabit(false)}
                className="text-warm-400 hover:text-warm-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewHabit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Bad Habit to Break
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doomscrolling, Late Night Snacking..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full text-sm font-semibold bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3 py-2.5 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Why are you quitting?
                </label>
                <textarea
                  rows={2}
                  placeholder="Why is it important to break this habit?"
                  value={newHabitReason}
                  onChange={(e) => setNewHabitReason(e.target.value)}
                  className="w-full text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3 py-2 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingHabit(false)}
                  className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-focus-600 hover:bg-focus-700 text-white font-bold text-xs shadow-sm"
                >
                  Start Streak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET CONFIRMATION (COMPASSIONATE) */}
      {resetTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-warm-850 rounded-3xl p-5 max-w-sm w-full border border-warm-200 dark:border-warm-800 shadow-lifted space-y-3.5 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 mx-auto flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-black text-warm-900 dark:text-warm-100">
                Reset Clean Streak?
              </h2>
              <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
                A slip is simply data, not failure. Every reset is an opportunity to strengthen your awareness.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setResetTargetId(null)}
                className="flex-1 py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-bold text-xs"
              >
                Keep Streak
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-3 rounded-xl bg-focus-600 hover:bg-focus-700 text-white font-bold text-xs shadow-sm"
              >
                Reset & Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MILESTONE DETAIL (WITH PHOSPHOR ICON) */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-warm-850 rounded-3xl p-5 max-w-sm w-full border border-warm-200 dark:border-warm-800 shadow-lifted space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                {getMilestonePhosphorIcon(selectedMilestone.id, true, 30)}
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-warm-400 hover:text-warm-700 p-1"
                aria-label="Close milestone detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs font-black uppercase text-focus-600 tracking-wider">
                {selectedMilestone.hours < 24 ? `${selectedMilestone.hours} Hours Milestone` : `${Math.floor(selectedMilestone.hours / 24)} Days Milestone`}
              </span>
              <h2 className="text-xl font-black text-warm-900 dark:text-warm-100 mt-0.5">
                {selectedMilestone.title}
              </h2>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                {selectedMilestone.rewardDescription}
              </p>
            </div>

            <div className="p-3.5 bg-warm-50 dark:bg-warm-900 rounded-2xl border border-warm-200/80 dark:border-warm-800">
              <p className="text-xs text-warm-700 dark:text-warm-300 leading-relaxed">
                {selectedMilestone.benefitDetail}
              </p>
            </div>

            <button
              onClick={() => setSelectedMilestone(null)}
              className="w-full py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CRAVING SOS (3-MIN 4-4-4-4 BREATHING) */}
      {isCravingSosOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-warm-850 rounded-3xl p-6 max-w-sm w-full border border-warm-200 dark:border-warm-800 shadow-lifted space-y-5 text-center animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-focus-600 uppercase tracking-wider">
                Urge Surfing Tool
              </span>
              <button
                onClick={() => setIsCravingSosOpen(false)}
                className="text-warm-400 hover:text-warm-700 p-1"
                aria-label="Close craving tool"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-black text-warm-900 dark:text-warm-100">
                Surfing the Urge
              </h2>
              <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
                A craving peaks like a wave in 3 minutes. Breathe through it.
              </p>
            </div>

            {/* Breathing Animation Circle */}
            <div className="py-2 flex items-center justify-center">
              <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-black shadow-lifted transition-all duration-1000 ${
                sosPhase === 'Inhale'
                  ? 'bg-focus-500 scale-110'
                  : sosPhase === 'Hold'
                    ? 'bg-amber-500 scale-110 ring-8 ring-amber-200/50'
                    : sosPhase === 'Exhale'
                      ? 'bg-leaf-600 scale-90'
                      : 'bg-slate-600 scale-90'
              }`}>
                <span className="text-xl">{sosPhase}</span>
                <span className="text-xs font-mono opacity-80">4 sec</span>
              </div>
            </div>

            <div className="text-xs font-mono font-bold text-warm-500">
              Time Remaining: {Math.floor(sosSecondsLeft / 60)}:{String(sosSecondsLeft % 60).padStart(2, '0')}
            </div>

            <button
              onClick={() => setIsCravingSosOpen(false)}
              className="w-full py-3 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-bold text-xs"
            >
              Exit Breathing Tool
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
