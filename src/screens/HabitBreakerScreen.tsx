import React, { useState, useEffect } from 'react';
import type { HabitQuitTracker, HabitMilestone } from '../types';
import { HABIT_MILESTONES } from '../lib/storage';
import {
  ShieldCheck,
  Flame,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trash2,
  X,
  HeartHandshake,
  Sprout,
  Check,
  Wind as WindIcon,
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
import { ART, SegmentedTabs, ProgressBar } from '../components/ui';

interface HabitBreakerScreenProps {
  trackers: HabitQuitTracker[];
  onUpdateTrackers: (updated: HabitQuitTracker[]) => void;
  onOpenProfile?: () => void;
}

// Phosphor Icon renderer for each milestone
export function getMilestonePhosphorIcon(milestoneId: string, isUnlocked: boolean, size = 26) {
  const weight = isUnlocked ? 'fill' : 'regular';
  const colorClass = isUnlocked ? '' : 'text-warm-400 dark:text-warm-600';

  switch (milestoneId) {
    case 'm-2h':
      return <Plant size={size} weight={weight} className={isUnlocked ? 'text-forest-500' : colorClass} />;
    case 'm-4h':
      return <Waves size={size} weight={weight} className={isUnlocked ? 'text-sky-500' : colorClass} />;
    case 'm-8h':
      return <Wind size={size} weight={weight} className={isUnlocked ? 'text-forest-400' : colorClass} />;
    case 'm-12h':
      return <Sun size={size} weight={weight} className={isUnlocked ? 'text-honey-500' : colorClass} />;
    case 'm-24h':
      return <Trophy size={size} weight={weight} className={isUnlocked ? 'text-honey-400' : colorClass} />;
    case 'm-48h':
      return <Flame size={size} className={isUnlocked ? 'text-focus-500 fill-focus-500' : colorClass} />;
    case 'm-3d':
      return <Lightning size={size} weight={weight} className={isUnlocked ? 'text-honey-400' : colorClass} />;
    case 'm-5d':
      return <ShieldStar size={size} weight={weight} className={isUnlocked ? 'text-sky-600' : colorClass} />;
    case 'm-7d':
      return <Diamond size={size} weight={weight} className={isUnlocked ? 'text-sky-400' : colorClass} />;
    case 'm-10d':
      return <RocketLaunch size={size} weight={weight} className={isUnlocked ? 'text-focus-600' : colorClass} />;
    case 'm-14d':
      return <Crown size={size} weight={weight} className={isUnlocked ? 'text-honey-500' : colorClass} />;
    case 'm-21d':
      return <Brain size={size} weight={weight} className={isUnlocked ? 'text-pink-400' : colorClass} />;
    case 'm-30d':
      return <MedalMilitary size={size} weight={weight} className={isUnlocked ? 'text-focus-600' : colorClass} />;
    default:
      return <Trophy size={size} weight={weight} className={isUnlocked ? 'text-focus-600' : colorClass} />;
  }
}

// Milestones shown on the Progress timeline row
const TIMELINE_HOURS = [2, 4, 8, 24, 168, 504, 720];
const TIMELINE_MILESTONES = HABIT_MILESTONES.filter((m) => TIMELINE_HOURS.includes(m.hours));

const formatMilestoneLabel = (hours: number) =>
  hours < 24 ? `${hours}h` : hours === 24 ? '24h' : `${Math.floor(hours / 24)} days`;

type SosOptionId = 'breathing' | 'movement' | 'water' | 'grounding';
const SOS_OPTIONS: { id: SosOptionId; label: string; instruction: string }[] = [
  { id: 'breathing', label: '4-4-4 Breathing', instruction: 'Inhale for 4s, hold for 4s, exhale for 4s. Repeat 5 times.' },
  { id: 'movement', label: 'Quick Movement', instruction: 'Stand up and do 10 jumping jacks or a brisk 1-minute walk.' },
  { id: 'water', label: 'Drink Water', instruction: 'Slowly drink a full glass of cold water, sip by sip.' },
  { id: 'grounding', label: 'Grounding (5-4-3-2-1)', instruction: 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.' },
];

type HabitTab = 'progress' | 'insights';

const MODAL_PANEL = 'bg-[#FFFCF6] dark:bg-forest-900 rounded-3xl p-5 w-full border border-warm-200 dark:border-white/10 shadow-lifted text-warm-800 dark:text-[#F6EEDF] animate-in fade-in zoom-in-95';
const MODAL_SECONDARY_BTN = 'flex-1 py-3 rounded-full bg-warm-100 dark:bg-white/10 text-warm-700 dark:text-[#F6EEDF] font-bold text-xs hover:bg-warm-200 dark:hover:bg-white/15 transition-colors';

export const HabitBreakerScreen: React.FC<HabitBreakerScreenProps> = ({
  trackers,
  onUpdateTrackers,
  onOpenProfile,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(trackers[0]?.id || null);
  const [activeTab, setActiveTab] = useState<HabitTab>('progress');
  const [isHabitMenuOpen, setIsHabitMenuOpen] = useState(false);
  const [isSosCollapsed, setIsSosCollapsed] = useState(false);
  const [sosOption, setSosOption] = useState<SosOptionId>('breathing');

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
            colors: ['#F0B84A', '#E0621F', '#6B925F', '#F6EEDF'],
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
        colors: ['#6B925F', '#F0B84A'],
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

  // Currently selected habit tracker
  const tracker = trackers.find((t) => t.id === expandedHabitId) || trackers[0] || null;

  // Derived timing values for the selected tracker
  const elapsedMs = tracker ? Math.max(0, now.getTime() - new Date(tracker.quitDate).getTime()) : 0;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  const nextMilestone = HABIT_MILESTONES.find((m) => elapsedHours < m.hours) || null;
  const reachedMilestones = HABIT_MILESTONES.filter((m) => elapsedHours >= m.hours);
  const currentMilestone = reachedMilestones[reachedMilestones.length - 1] || null;
  const previousMilestoneHours = nextMilestone
    ? (HABIT_MILESTONES[HABIT_MILESTONES.indexOf(nextMilestone) - 1]?.hours || 0)
    : (HABIT_MILESTONES[HABIT_MILESTONES.length - 1]?.hours || 720);
  const progressPercent = nextMilestone
    ? Math.min(100, Math.max(0, ((elapsedHours - previousMilestoneHours) / (nextMilestone.hours - previousMilestoneHours)) * 100))
    : 100;
  const nextTimelineId = TIMELINE_MILESTONES.find((m) => elapsedHours < m.hours)?.id;

  const streakLabel = days >= 1 ? `${days} ${days === 1 ? 'day' : 'days'}` : `${hours}h ${minutes}m`;
  const brainMilestone = currentMilestone || nextMilestone;
  const brainText = brainMilestone?.benefitDetail || 'After 7 days, dopamine receptors start to regain sensitivity.';
  const activeSos = SOS_OPTIONS.find((o) => o.id === sosOption) || SOS_OPTIONS[0];

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-forest-900 to-forest-950 text-[#F6EEDF]">
      <div className="max-w-md mx-auto w-full px-4 pt-4 pb-28 safe-top space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <h1 className="text-[24px] leading-tight font-extrabold tracking-tight text-[#F6EEDF]">
            Habit Breaker
          </h1>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile"
            className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#F6EEDF]/80 shrink-0 active:scale-95 transition-transform"
          >
            <img src={ART.avatar} alt="" className="w-full h-full object-cover select-none" />
          </button>
        </div>

        {trackers.length === 0 || !tracker ? (
          <div className="card-forest text-center py-10 px-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-forest-400/25 flex items-center justify-center">
              <Sprout className="w-8 h-8 text-forest-200" />
            </div>
            <div className="max-w-xs mx-auto space-y-1">
              <h2 className="text-lg font-extrabold">No Habits Being Tracked</h2>
              <p className="text-xs text-[#F6EEDF]/70">
                Break bad habits like doomscrolling or procrastination. Earn milestones as your dopamine resets.
              </p>
            </div>
            <button onClick={() => setIsAddingHabit(true)} className="btn-primary px-6 py-3 text-sm">
              <Plus className="w-4 h-4" />
              <span>Create Habit Tracker</span>
            </button>
          </div>
        ) : (
          <>
            {/* Habit pill selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHabitMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isHabitMenuOpen}
                className="inline-flex items-center gap-1.5 max-w-full px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-bold transition-colors"
              >
                <span className="truncate">{tracker.habitName}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isHabitMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isHabitMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsHabitMenuOpen(false)} />
                  <div role="listbox" className="absolute left-0 top-full mt-2 z-40 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-forest-800 border border-white/10 shadow-lifted p-1.5">
                    {trackers.map((t) => (
                      <button
                        key={t.id}
                        role="option"
                        aria-selected={t.id === tracker.id}
                        onClick={() => {
                          setExpandedHabitId(t.id);
                          setIsHabitMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                          t.id === tracker.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{t.habitName}</span>
                        {t.id === tracker.id && <Check className="w-4 h-4 text-honey-400 shrink-0" />}
                      </button>
                    ))}
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      onClick={() => {
                        setIsHabitMenuOpen(false);
                        setIsAddingHabit(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-honey-300 hover:bg-white/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add new habit</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <SegmentedTabs<HabitTab>
              dark
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { id: 'progress', label: 'Progress' },
                { id: 'insights', label: 'Insights' },
              ]}
            />

            {activeTab === 'progress' ? (
              <>
                {/* Current Streak */}
                <div className="card-forest rounded-[20px] p-4 flex items-center justify-between gap-3 bg-gradient-to-b from-forest-600 to-forest-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={ART.fire} alt="" aria-hidden="true" className="w-12 h-12 object-contain shrink-0 select-none" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F6EEDF]/80">Current Streak</p>
                      <p className="text-[26px] leading-tight font-extrabold">{streakLabel}</p>
                      <p className="text-xs text-[#F6EEDF]/70">Great progress! Keep going.</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-forest-400/30 border border-forest-300/20 flex items-center justify-center shrink-0">
                    <Sprout className="w-8 h-8 text-forest-200" />
                  </div>
                </div>

                {/* Milestone timeline */}
                <div className="overflow-x-auto -mx-4 px-4 pb-1">
                  <div className="relative flex items-start justify-between min-w-[340px]">
                    <div className="absolute left-[14px] right-[14px] top-[13px] h-0.5 bg-[#F6EEDF]/20" />
                    {TIMELINE_MILESTONES.map((m) => {
                      const reached = elapsedHours >= m.hours;
                      const isNext = m.id === nextTimelineId;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMilestone(m)}
                          className="relative z-10 flex flex-col items-center gap-1.5 w-12"
                          aria-label={`${formatMilestoneLabel(m.hours)} milestone${reached ? ' reached' : ''}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              reached
                                ? 'bg-honey-400 text-forest-900'
                                : isNext
                                  ? 'bg-forest-900 border-2 border-honey-400/70'
                                  : 'bg-forest-900 border-2 border-[#F6EEDF]/30'
                            }`}
                          >
                            {reached && <Check className="w-4 h-4 stroke-[3]" />}
                          </span>
                          <span className={`text-[11px] font-semibold whitespace-nowrap ${reached || isNext ? 'text-[#F6EEDF]' : 'text-[#F6EEDF]/60'}`}>
                            {formatMilestoneLabel(m.hours)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brain healing */}
                <div className="card-forest p-4 flex items-center gap-3.5">
                  <img src={ART.brain} alt="" aria-hidden="true" className="w-14 h-14 object-contain shrink-0 select-none" />
                  <div className="min-w-0">
                    <h2 className="text-base font-extrabold">Your Brain is Healing</h2>
                    <p className="text-xs text-[#F6EEDF]/75 leading-relaxed mt-0.5">{brainText}</p>
                  </div>
                </div>

                {/* Craving SOS bottom sheet */}
                <div className="-mx-4 bg-[#FFFCF6] dark:bg-warm-100 text-warm-800 rounded-t-3xl px-5 pt-5 pb-6 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.4)]">
                  <button
                    type="button"
                    onClick={() => setIsSosCollapsed((v) => !v)}
                    aria-expanded={!isSosCollapsed}
                    className="w-full flex items-start justify-between text-left"
                  >
                    <div>
                      <h2 className="text-lg font-extrabold text-warm-800">Craving SOS</h2>
                      <p className="text-xs text-warm-500 mt-0.5">Take 1 minute to reset</p>
                    </div>
                    {isSosCollapsed ? <ChevronDown className="w-5 h-5 text-warm-500 mt-1" /> : <ChevronUp className="w-5 h-5 text-warm-500 mt-1" />}
                  </button>

                  {!isSosCollapsed && (
                    <div className="mt-4 space-y-2.5">
                      <div role="radiogroup" aria-label="Craving SOS options" className="space-y-2">
                        {SOS_OPTIONS.map((o) => {
                          const selected = o.id === sosOption;
                          return (
                            <button
                              key={o.id}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => setSosOption(o.id)}
                              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left text-sm font-semibold transition-colors ${
                                selected ? 'border-sky-300 bg-sky-50/70' : 'border-warm-200 bg-white/60 hover:bg-warm-50'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  selected ? 'border-sky-500 bg-sky-500' : 'border-warm-300 bg-white'
                                }`}
                              >
                                {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                              </span>
                              <span>{o.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-xs text-warm-600 leading-relaxed px-1 pt-1">{activeSos.instruction}</p>

                      {sosOption === 'breathing' && (
                        <button
                          type="button"
                          onClick={() => openSosModal(tracker.id)}
                          className="w-full py-2.5 rounded-full border border-warm-300 text-warm-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-warm-50 transition-colors"
                        >
                          <WindIcon className="w-4 h-4" />
                          <span>Start 3-min guided breathing</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleIncrementCraving(tracker.id)}
                        className="btn-primary w-full py-3.5 text-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>I resisted the craving</span>
                      </button>
                      <p className="text-center text-[11px] text-warm-500">
                        {tracker.cravingsResisted} cravings resisted so far
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Live clean timer */}
                <div className="card-forest p-4">
                  <p className="text-xs font-semibold text-[#F6EEDF]/70 mb-2.5">Clean for</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { v: days, l: 'Days' },
                      { v: hours, l: 'Hours' },
                      { v: minutes, l: 'Mins' },
                      { v: seconds, l: 'Secs' },
                    ].map((u) => (
                      <div key={u.l} className="bg-white/5 border border-white/10 rounded-2xl py-2.5">
                        <span className={`block text-2xl font-extrabold font-mono ${u.l === 'Secs' ? 'text-honey-400' : ''}`}>{u.v}</span>
                        <span className="text-[10px] uppercase font-bold text-[#F6EEDF]/60 tracking-wider">{u.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-forest p-4">
                    <ShieldCheck className="w-5 h-5 text-forest-300" />
                    <p className="text-2xl font-extrabold mt-2">{tracker.cravingsResisted}</p>
                    <p className="text-xs text-[#F6EEDF]/70">Cravings resisted</p>
                    <button
                      onClick={() => handleIncrementCraving(tracker.id)}
                      className="mt-2.5 w-full py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold transition-colors"
                    >
                      + Resisted
                    </button>
                  </div>
                  <div className="card-forest p-4">
                    <RotateCcw className="w-5 h-5 text-honey-300" />
                    <p className="text-2xl font-extrabold mt-2">{tracker.resetsCount}</p>
                    <p className="text-xs text-[#F6EEDF]/70">Resets</p>
                    <button
                      onClick={() => setResetTargetId(tracker.id)}
                      className="mt-2.5 w-full py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold transition-colors"
                    >
                      Reset Streak
                    </button>
                  </div>
                </div>

                {/* Reason */}
                {tracker.reason && (
                  <div className="card-forest p-4 flex items-start gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-honey-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#F6EEDF]/60">Why I'm quitting</p>
                      <p className="text-sm italic leading-relaxed mt-0.5">"{tracker.reason}"</p>
                    </div>
                  </div>
                )}

                {/* Next milestone */}
                {nextMilestone && (
                  <div className="card-forest p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[#F6EEDF]/70">Next:</span>
                        {getMilestonePhosphorIcon(nextMilestone.id, false, 16)}
                        <span>{nextMilestone.title}</span>
                      </span>
                      <span className="text-[#F6EEDF]/70">{Math.round(progressPercent)}%</span>
                    </div>
                    <ProgressBar
                      value={progressPercent}
                      className="h-2 bg-white/10"
                      barClassName="bg-gradient-to-r from-honey-300 to-honey-400"
                    />
                  </div>
                )}

                {/* Achievements trigger */}
                <button
                  onClick={() => setIsRewardsDialogOpen(true)}
                  className="card-forest w-full p-4 flex items-center justify-between text-left active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-honey-400/20 flex items-center justify-center shrink-0">
                      <Trophy size={22} weight="fill" className="text-honey-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-extrabold">Unlockable Achievements</h2>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-honey-400 text-forest-900">
                          {totalUnlockedCount}/{HABIT_MILESTONES.length}
                        </span>
                      </div>
                      <p className="text-xs text-[#F6EEDF]/70 mt-0.5">View all recovery reward milestones</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#F6EEDF]/60 shrink-0" />
                </button>

                {/* Milestones list for this habit */}
                <div className="card-forest p-2">
                  <p className="px-2.5 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#F6EEDF]/60">Milestones</p>
                  {HABIT_MILESTONES.map((m) => {
                    const unlocked = tracker.unlockedMilestones.includes(m.id) || elapsedHours >= m.hours;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMilestone(m)}
                        className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${unlocked ? 'bg-honey-400/20' : 'bg-white/5'}`}>
                          {getMilestonePhosphorIcon(m.id, unlocked, 20)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${unlocked ? '' : 'text-[#F6EEDF]/60'}`}>{m.title}</p>
                          <p className="text-[11px] text-[#F6EEDF]/55">
                            {m.hours < 24 ? `${m.hours} hours` : `${Math.floor(m.hours / 24)} days`}
                          </p>
                        </div>
                        {unlocked ? (
                          <CheckCircle size={18} weight="fill" className="text-honey-400 shrink-0" />
                        ) : (
                          <Lock size={15} weight="bold" className="text-[#F6EEDF]/40 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Delete habit */}
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => handleDeleteHabit(tracker.id)}
                    className="text-xs text-[#F6EEDF]/55 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Habit</span>
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* SEPARATE DIALOG VIEW: UNLOCKABLE ACHIEVEMENTS (GRID VIEW WITH PHOSPHOR ICONS) */}
      {isRewardsDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className={`${MODAL_PANEL} max-w-lg max-h-[88vh] flex flex-col`}>
            {/* Dialog Header */}
            <div className="flex items-start justify-between pb-3 border-b border-warm-200 dark:border-white/10 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Trophy size={20} weight="fill" className="text-honey-400" />
                  <h2 className="text-lg font-extrabold">Unlockable Achievements</h2>
                </div>
                <p className="text-xs text-warm-500 dark:text-[#F6EEDF]/60">
                  {totalUnlockedCount} of {HABIT_MILESTONES.length} milestones unlocked • Tap any to inspect
                </p>
              </div>
              <button
                onClick={() => setIsRewardsDialogOpen(false)}
                className="p-1.5 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-warm-100 dark:hover:bg-white/10 transition-colors"
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
                          ? 'bg-honey-50 dark:bg-forest-800 border-honey-300 dark:border-honey-400/40'
                          : 'bg-warm-50/60 dark:bg-white/5 border-warm-200/80 dark:border-white/10 opacity-75'
                      }`}
                    >
                      {/* Unlocked / Locked status indicator */}
                      <div className="absolute top-2 right-2">
                        {isUnlocked ? (
                          <CheckCircle size={15} weight="fill" className="text-forest-500" />
                        ) : (
                          <Lock size={13} weight="bold" className="text-warm-400" />
                        )}
                      </div>

                      {/* Icon Circle */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                        isUnlocked
                          ? 'bg-honey-100 dark:bg-honey-400/20 scale-105'
                          : 'bg-warm-100 dark:bg-white/5'
                      }`}>
                        {getMilestonePhosphorIcon(milestone.id, isUnlocked, 28)}
                      </div>

                      {/* Time and Title */}
                      <div className="w-full">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                          isUnlocked ? 'text-focus-600 dark:text-honey-400' : 'text-warm-400'
                        }`}>
                          {milestone.hours < 24 ? `${milestone.hours} Hours` : `${Math.floor(milestone.hours / 24)} Days`}
                        </span>
                        <h3 className="text-xs font-bold truncate mt-0.5">
                          {milestone.rewardDescription}
                        </h3>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isUnlocked
                          ? 'bg-forest-100 text-forest-800 dark:bg-forest-700 dark:text-forest-100'
                          : 'bg-warm-100 dark:bg-white/10 text-warm-500'
                      }`}>
                        {isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="pt-3 border-t border-warm-200 dark:border-white/10 shrink-0 flex">
              <button onClick={() => setIsRewardsDialogOpen(false)} className={MODAL_SECONDARY_BTN}>
                Close Achievements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW BAD HABIT */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${MODAL_PANEL} max-w-sm space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Track New Bad Habit</h2>
              <button
                onClick={() => setIsAddingHabit(false)}
                className="text-warm-400 hover:text-warm-700 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewHabit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-warm-700 dark:text-[#F6EEDF]/80 mb-1">
                  Bad Habit to Break
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doomscrolling, Late Night Snacking..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full text-sm font-semibold bg-white dark:bg-white/5 border border-warm-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-warm-800 dark:text-[#F6EEDF] focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-700 dark:text-[#F6EEDF]/80 mb-1">
                  Why are you quitting?
                </label>
                <textarea
                  rows={2}
                  placeholder="Why is it important to break this habit?"
                  value={newHabitReason}
                  onChange={(e) => setNewHabitReason(e.target.value)}
                  className="w-full text-sm bg-white dark:bg-white/5 border border-warm-200 dark:border-white/10 rounded-xl px-3 py-2 text-warm-800 dark:text-[#F6EEDF] focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button type="button" onClick={() => setIsAddingHabit(false)} className={MODAL_SECONDARY_BTN}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-3 text-xs">
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
          <div className={`${MODAL_PANEL} max-w-sm space-y-3.5 text-center`}>
            <div className="w-12 h-12 rounded-full bg-honey-100 dark:bg-honey-400/20 text-focus-600 dark:text-honey-400 mx-auto flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-extrabold">Reset Clean Streak?</h2>
              <p className="text-xs text-warm-500 dark:text-[#F6EEDF]/65 mt-1">
                A slip is simply data, not failure. Every reset is an opportunity to strengthen your awareness.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button onClick={() => setResetTargetId(null)} className={MODAL_SECONDARY_BTN}>
                Keep Streak
              </button>
              <button onClick={handleConfirmReset} className="btn-primary flex-1 py-3 text-xs">
                Reset & Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MILESTONE DETAIL (WITH PHOSPHOR ICON) */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${MODAL_PANEL} max-w-sm space-y-3.5`}>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-honey-100 dark:bg-honey-400/20 flex items-center justify-center">
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
              <span className="text-xs font-extrabold uppercase text-focus-600 dark:text-honey-400 tracking-wider">
                {selectedMilestone.hours < 24 ? `${selectedMilestone.hours} Hours Milestone` : `${Math.floor(selectedMilestone.hours / 24)} Days Milestone`}
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">{selectedMilestone.title}</h2>
              <p className="text-xs font-bold text-forest-600 dark:text-forest-300 mt-0.5">
                {selectedMilestone.rewardDescription}
              </p>
            </div>

            <div className="p-3.5 bg-warm-50 dark:bg-white/5 rounded-2xl border border-warm-200/80 dark:border-white/10">
              <p className="text-xs text-warm-700 dark:text-[#F6EEDF]/80 leading-relaxed">
                {selectedMilestone.benefitDetail}
              </p>
            </div>

            <div className="flex">
              <button onClick={() => setSelectedMilestone(null)} className={MODAL_SECONDARY_BTN}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRAVING SOS (3-MIN 4-4-4-4 BREATHING) */}
      {isCravingSosOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-forest rounded-3xl p-6 max-w-sm w-full shadow-lifted space-y-5 text-center animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-honey-400 uppercase tracking-wider">
                Urge Surfing Tool
              </span>
              <button
                onClick={() => setIsCravingSosOpen(false)}
                className="text-[#F6EEDF]/60 hover:text-[#F6EEDF] p-1"
                aria-label="Close craving tool"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold">Surfing the Urge</h2>
              <p className="text-xs text-[#F6EEDF]/70 mt-1">
                A craving peaks like a wave in 3 minutes. Breathe through it.
              </p>
            </div>

            {/* Breathing Animation Circle */}
            <div className="py-2 flex items-center justify-center">
              <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center font-extrabold shadow-lifted transition-all duration-1000 ${
                sosPhase === 'Inhale'
                  ? 'bg-focus-500 text-white scale-110'
                  : sosPhase === 'Hold'
                    ? 'bg-honey-400 text-forest-900 scale-110 ring-8 ring-honey-200/30'
                    : sosPhase === 'Exhale'
                      ? 'bg-forest-400 text-white scale-90'
                      : 'bg-forest-600 text-white scale-90'
              }`}>
                <span className="text-xl">{sosPhase}</span>
                <span className="text-xs font-mono opacity-80">4 sec</span>
              </div>
            </div>

            <div className="text-xs font-mono font-bold text-[#F6EEDF]/70">
              Time Remaining: {Math.floor(sosSecondsLeft / 60)}:{String(sosSecondsLeft % 60).padStart(2, '0')}
            </div>

            <button
              onClick={() => setIsCravingSosOpen(false)}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 font-bold text-xs transition-colors"
            >
              Exit Breathing Tool
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
