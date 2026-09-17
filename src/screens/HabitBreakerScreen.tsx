import React, { useState, useEffect } from 'react';
import type { HabitQuitTracker, HabitMilestone } from '../types';
import { HABIT_MILESTONES } from '../lib/storage';
import { 
  ShieldCheck, 
  Flame, 
  HeartHandshake, 
  Sparkles, 
  Award, 
  Lock, 
  CheckCircle2, 
  RotateCcw, 
  Edit3, 
  X,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundPlayer } from '../lib/audio';

interface HabitBreakerScreenProps {
  tracker: HabitQuitTracker;
  onUpdateTracker: (updated: HabitQuitTracker) => void;
}

export const HabitBreakerScreen: React.FC<HabitBreakerScreenProps> = ({
  tracker,
  onUpdateTracker,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [selectedMilestone, setSelectedMilestone] = useState<HabitMilestone | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editHabitName, setEditHabitName] = useState(tracker.habitName);
  const [editReason, setEditReason] = useState(tracker.reason);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isCravingSosOpen, setIsCravingSosOpen] = useState(false);
  const [sosSecondsLeft, setSosSecondsLeft] = useState(180); // 3 minutes
  const [sosPhase, setSosPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute elapsed time
  const quitTime = new Date(tracker.quitDate).getTime();
  const currentMs = now.getTime();
  const elapsedMs = Math.max(0, currentMs - quitTime);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // Auto-check for new unlocked milestones
  useEffect(() => {
    const newlyUnlocked: string[] = [];
    HABIT_MILESTONES.forEach((m) => {
      if (elapsedHours >= m.hours && !tracker.unlockedMilestones.includes(m.id)) {
        newlyUnlocked.push(m.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      soundPlayer.playMilestoneCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#f26543', '#549646'],
        });
      } catch {
        // fallback
      }
      onUpdateTracker({
        ...tracker,
        unlockedMilestones: [...tracker.unlockedMilestones, ...newlyUnlocked],
      });
    }
  }, [elapsedHours, tracker, onUpdateTracker]);

  // Next milestone calculation
  const nextMilestone = HABIT_MILESTONES.find((m) => elapsedHours < m.hours) || null;
  const previousMilestoneHours = nextMilestone 
    ? (HABIT_MILESTONES[HABIT_MILESTONES.indexOf(nextMilestone) - 1]?.hours || 0)
    : (HABIT_MILESTONES[HABIT_MILESTONES.length - 1]?.hours || 720);

  const nextMilestoneProgress = nextMilestone
    ? Math.min(100, Math.max(0, ((elapsedHours - previousMilestoneHours) / (nextMilestone.hours - previousMilestoneHours)) * 100))
    : 100;

  // Craving SOS 3-Minute Breathing cycle
  useEffect(() => {
    if (!isCravingSosOpen) return;
    const interval = setInterval(() => {
      setSosSecondsLeft((prev) => {
        if (prev <= 1) {
          // Completed craving SOS!
          setIsCravingSosOpen(false);
          soundPlayer.playMilestoneCelebration();
          onUpdateTracker({
            ...tracker,
            cravingsResisted: tracker.cravingsResisted + 1,
          });
          return 180;
        }
        // 16-second box breathing cycle: 4s inhale, 4s hold, 4s exhale, 4s rest
        const cycleSec = (180 - prev) % 16;
        if (cycleSec < 4) setSosPhase('Inhale');
        else if (cycleSec < 8) setSosPhase('Hold');
        else if (cycleSec < 12) setSosPhase('Exhale');
        else setSosPhase('Rest');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCravingSosOpen, tracker, onUpdateTracker]);

  const handleSaveSettings = () => {
    onUpdateTracker({
      ...tracker,
      habitName: editHabitName.trim() || 'Bad Habit',
      reason: editReason.trim() || 'To rebuild focus and regain control.',
    });
    setIsEditing(false);
  };

  const handleCompassionateReset = () => {
    onUpdateTracker({
      ...tracker,
      quitDate: new Date().toISOString(),
      resetsCount: tracker.resetsCount + 1,
      unlockedMilestones: [],
    });
    setShowResetConfirm(false);
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-leaf-100 dark:bg-leaf-950/60 text-leaf-800 dark:text-leaf-300 text-xs sm:text-sm font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-leaf-600" />
            <span>Habit Freedom Streak</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 tracking-tight">
            {tracker.habitName}
          </h1>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2.5 rounded-2xl text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
          title="Edit Habit Details"
          aria-label="Edit Habit Details"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Live Streak Timer Card */}
      <div className="bg-gradient-to-br from-white to-warm-50 dark:from-warm-850 dark:to-warm-900 rounded-3xl p-5 sm:p-6 border border-warm-200/90 dark:border-warm-800 shadow-lifted relative overflow-hidden">
        {/* Background Subtle Dino watermark */}
        <img
          src="/pomo-dino.png"
          alt="Pomo Dino"
          className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 pointer-events-none"
        />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-bold text-warm-500 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-focus-600" />
            <span>Clean Elapsed Time</span>
          </span>
          <span className="text-xs font-bold text-leaf-700 dark:text-leaf-300 bg-leaf-50 dark:bg-leaf-950/60 px-2.5 py-1 rounded-full border border-leaf-200/60">
            {tracker.cravingsResisted} Cravings Resisted 🛡️
          </span>
        </div>

        {/* Big Counter Digits */}
        <div className="grid grid-cols-4 gap-2 text-center my-3">
          <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-warm-800/80 shadow-soft">
            <span className="block text-3xl sm:text-4xl font-black font-mono text-warm-900 dark:text-warm-100">
              {days}
            </span>
            <span className="text-xs uppercase font-bold text-warm-500">Days</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-warm-800/80 shadow-soft">
            <span className="block text-3xl sm:text-4xl font-black font-mono text-warm-900 dark:text-warm-100">
              {hours}
            </span>
            <span className="text-xs uppercase font-bold text-warm-500">Hours</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-warm-800/80 shadow-soft">
            <span className="block text-3xl sm:text-4xl font-black font-mono text-warm-900 dark:text-warm-100">
              {minutes}
            </span>
            <span className="text-xs uppercase font-bold text-warm-500">Mins</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-warm-800/80 shadow-soft">
            <span className="block text-3xl sm:text-4xl font-black font-mono text-focus-600 dark:text-focus-400">
              {seconds}
            </span>
            <span className="text-xs uppercase font-bold text-warm-500">Secs</span>
          </div>
        </div>

        {/* Motivational Why */}
        {tracker.reason && (
          <p className="text-sm italic font-medium text-warm-700 dark:text-warm-300 mt-3 pt-3 border-t border-warm-200/60 dark:border-warm-800 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-focus-500 shrink-0" />
            <span>&ldquo;{tracker.reason}&rdquo;</span>
          </p>
        )}

        {/* Next Milestone Progress Bar */}
        {nextMilestone && (
          <div className="mt-4 pt-3 border-t border-warm-200/60 dark:border-warm-800 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="text-warm-700 dark:text-warm-300 flex items-center gap-1.5">
                <span>Next:</span>
                <strong className="text-focus-600">{nextMilestone.title}</strong>
              </span>
              <span className="text-warm-500 font-mono text-xs sm:text-sm">
                {Math.round(nextMilestoneProgress)}%
              </span>
            </div>
            <div className="w-full h-3 bg-warm-200/80 dark:bg-warm-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-focus-500 to-leaf-500 rounded-full transition-all duration-1000"
                style={{ width: `${nextMilestoneProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Emergency Craving SOS Button */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            setSosSecondsLeft(180);
            setIsCravingSosOpen(true);
          }}
          className="flex-1 min-h-[48px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-focus-600 to-dino-tomato text-white font-bold text-sm shadow-lifted flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>Craving Alert? 3-Min Calm Breath</span>
        </button>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="p-3.5 min-h-[48px] rounded-2xl bg-warm-100 dark:bg-warm-850 text-warm-500 hover:text-warm-900 dark:hover:text-warm-100 transition-colors"
          title="Reset timer without shame"
          aria-label="Reset timer without shame"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Smoke Free Style Milestone Badges & Timeline */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-warm-600 dark:text-warm-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-focus-600" />
            <span>Milestone Rewards (Smoke Free)</span>
          </h2>
          <span className="text-xs sm:text-sm font-bold text-leaf-600">
            {HABIT_MILESTONES.filter((m) => elapsedHours >= m.hours).length} / {HABIT_MILESTONES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HABIT_MILESTONES.map((m) => {
            const isUnlocked = elapsedHours >= m.hours;
            const isCurrentNext = nextMilestone?.id === m.id;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMilestone(m)}
                className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative ${
                  isUnlocked
                    ? 'bg-white dark:bg-warm-850 border-leaf-400/80 shadow-soft hover:shadow-lifted'
                    : isCurrentNext
                    ? 'bg-warm-50 dark:bg-warm-900 border-focus-400/80 border-dashed'
                    : 'bg-warm-100/60 dark:bg-warm-900/40 border-warm-200 dark:border-warm-800/80 opacity-70'
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    isUnlocked
                      ? 'bg-leaf-100 dark:bg-leaf-950/60 shadow-sm'
                      : 'bg-warm-200 dark:bg-warm-800'
                  }`}
                >
                  {isUnlocked ? m.badge : <Lock className="w-5 h-5 text-warm-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-mono font-bold text-warm-500">
                      {m.hours < 24 ? `${m.hours} Hours` : `${m.hours / 24} Days`}
                    </span>
                    {isUnlocked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-leaf-100 dark:bg-leaf-950 text-leaf-700 dark:text-leaf-300">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {isCurrentNext && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-focus-100 dark:bg-focus-950 text-focus-700 dark:text-focus-300 animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-warm-900 dark:text-warm-100 truncate mt-0.5">
                    {m.title}
                  </h3>
                  <p className="text-xs text-warm-500 dark:text-warm-400 truncate mt-0.5">
                    {m.rewardDescription}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-warm-850 rounded-3xl max-w-sm w-full p-5 border border-warm-200 dark:border-warm-800 shadow-lifted space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl p-2 rounded-2xl bg-warm-100 dark:bg-warm-800">
                  {selectedMilestone.badge}
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-warm-500">
                    {selectedMilestone.hours < 24 ? `${selectedMilestone.hours} Hours` : `${selectedMilestone.hours / 24} Days`} Milestone
                  </span>
                  <h3 className="text-base font-bold text-warm-900 dark:text-warm-100">
                    {selectedMilestone.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-warm-200"
                aria-label="Close milestone detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-warm-50 dark:bg-warm-900 border border-warm-200/80 dark:border-warm-800 space-y-1.5">
              <h4 className="text-xs font-bold text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-focus-600" />
                <span>What Is Happening In Your Body & Brain:</span>
              </h4>
              <p className="text-xs text-warm-700 dark:text-warm-300 leading-relaxed">
                {selectedMilestone.benefitDetail}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="w-full py-2.5 rounded-xl bg-focus-600 text-white text-xs font-bold hover:bg-focus-700 transition-colors"
              >
                Keep Going Strong!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Craving SOS 3-Minute Urge Surfing Breathing Modal */}
      {isCravingSosOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-warm-850 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-warm-200 dark:border-warm-800 shadow-lifted">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-focus-100 dark:bg-focus-900/60 text-focus-700 dark:text-focus-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Urge Surfing & Dopamine Reset</span>
              </div>
              <h3 className="text-xl font-bold text-warm-900 dark:text-warm-100">
                Ride The Craving Wave
              </h3>
              <p className="text-xs text-warm-500">
                A craving lasts only 3 minutes if you don’t fight it. Breathe with Pomo-Dino.
              </p>
            </div>

            {/* Breathing Animation Circle */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 ${
                  sosPhase === 'Inhale'
                    ? 'scale-125 bg-leaf-100 border-leaf-500 text-leaf-800 dark:bg-leaf-950/60'
                    : sosPhase === 'Hold'
                    ? 'scale-125 bg-focus-100 border-focus-500 text-focus-800 dark:bg-focus-950/60'
                    : sosPhase === 'Exhale'
                    ? 'scale-90 bg-warm-100 border-warm-400 text-warm-700 dark:bg-warm-800'
                    : 'scale-90 bg-warm-50 border-warm-300 text-warm-600 dark:bg-warm-900'
                }`}
              >
                <span className="text-lg font-black">{sosPhase}</span>
                <span className="text-xs font-mono opacity-80">
                  {Math.floor(sosSecondsLeft / 60)}:{String(sosSecondsLeft % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCravingSosOpen(false)}
              className="w-full py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 text-xs font-bold hover:bg-warm-200"
            >
              I Feel Calmer Now (Close)
            </button>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-warm-850 rounded-3xl max-w-sm w-full p-5 border border-warm-200 dark:border-warm-800 shadow-lifted space-y-4">
            <h3 className="text-sm font-bold text-warm-900 dark:text-warm-100">
              Customize Habit Goal
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Habit You Are Removing
                </label>
                <input
                  type="text"
                  value={editHabitName}
                  onChange={(e) => setEditHabitName(e.target.value)}
                  placeholder="e.g. Smoking / Vaping, Doomscrolling..."
                  className="w-full text-xs p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Your Core Motivation / Why
                </label>
                <textarea
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. To get my focus, time, and mental clarity back for my career."
                  className="w-full text-xs p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 rounded-xl bg-focus-600 text-white text-xs font-bold hover:bg-focus-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compassionate Reset Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-warm-850 rounded-3xl max-w-sm w-full p-5 border border-warm-200 dark:border-warm-800 shadow-lifted space-y-3">
            <div className="flex items-center gap-2 text-focus-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-warm-900 dark:text-warm-100">
                Restart Counter with Kindness
              </h3>
            </div>
            <p className="text-xs text-warm-600 dark:text-warm-400 leading-relaxed">
              Slips happen. In neuroscience and ADHD recovery, each restart trains the brain. You haven’t lost your progress or wisdom. Ready to restart the timer?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCompassionateReset}
                className="flex-1 py-2.5 rounded-xl bg-focus-600 text-white text-xs font-bold hover:bg-focus-700"
              >
                Restart Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
