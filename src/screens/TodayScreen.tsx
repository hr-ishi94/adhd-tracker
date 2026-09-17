import React, { useState } from 'react';
import type { RoutineBlock, DailyLog, BlockStatus, TodoItem, TodoPriority, DreamAssessment } from '../types';
import { formatTimeRange, timeToMinutes } from '../lib/time';
import { PriorityCard } from '../components/PriorityCard';
import { ProgressStrip } from '../components/ProgressStrip';
import { AdditionalTodosSection } from '../components/AdditionalTodosSection';
import { 
  Check, 
  FastForward, 
  Split, 
  Sparkles, 
  CheckCircle2, 
  History, 
  CalendarDays, 
  ChevronDown, 
  ChevronUp,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLog: DailyLog;
  currentBlock: RoutineBlock | null;
  nextBlock: RoutineBlock | null;
  todos: TodoItem[];
  dreamAssessment?: DreamAssessment | null;
  onUpdatePriority: (newPriority: string) => void;
  onMarkBlockStatus: (blockId: string, status: BlockStatus) => void;
  onOpenBreakdown: (block: RoutineBlock) => void;
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string, priority: TodoPriority) => boolean;
  onChangeTodoPriority: (id: string, priority: TodoPriority) => void;
  onDeleteTodo: (id: string) => void;
  onNavigateToLearning?: () => void;
  onOpenEveningReview?: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  routineBlocks,
  dailyLog,
  currentBlock,
  nextBlock,
  todos,
  dreamAssessment,
  onUpdatePriority,
  onMarkBlockStatus,
  onOpenBreakdown,
  onToggleTodo,
  onAddTodo,
  onChangeTodoPriority,
  onDeleteTodo,
  onNavigateToLearning,
}) => {
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const currentStatus = currentBlock ? dailyLog.blockStatus[currentBlock.id] || 'pending' : 'pending';

  // Check if all blocks today are completed/resolved
  const totalBlocks = routineBlocks.length;
  let resolvedCount = 0;
  routineBlocks.forEach((b) => {
    const s = dailyLog.blockStatus[b.id];
    if (s === 'done' || s === 'skipped') resolvedCount++;
  });
  const isAllDayResolved = totalBlocks > 0 && resolvedCount === totalBlocks;

  // Identify earlier blocks of today whose scheduled time has passed and are not marked done
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const pastUncompletedBlocks = routineBlocks.filter((b) => {
    if (currentBlock && b.id === currentBlock.id) return false;
    const startMin = timeToMinutes(b.startTime);
    const endMin = timeToMinutes(b.endTime);
    let isPast = false;
    if (startMin <= endMin) {
      isPast = endMin <= currentMinutes;
    } else {
      // Midnight crossover
      isPast = currentMinutes >= endMin && currentMinutes < startMin;
    }
    const status = dailyLog.blockStatus[b.id] || 'pending';
    return isPast && status !== 'done';
  });

  const triggerQuietCelebration = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#e14a27', '#f26543', '#549646'],
      disableForReducedMotion: true,
    });
  };

  const handleDone = (blockId: string) => {
    onMarkBlockStatus(blockId, 'done');
    if (resolvedCount + 1 === totalBlocks) {
      triggerQuietCelebration();
    }
  };

  const handleSkip = (blockId: string) => {
    onMarkBlockStatus(blockId, 'skipped');
    if (resolvedCount + 1 === totalBlocks) {
      triggerQuietCelebration();
    }
  };

  // Greeting by time of day
  const hour = now.getHours();
  const timeOfDayGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-3 pb-28 safe-top space-y-3.5">
      {/* Brand Header with Pomo-Dino */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2.5">
          <img 
            src="/pomo-dino.png" 
            alt="Pomo-Dino Logo" 
            className="w-10 h-10 rounded-2xl object-contain shadow-soft border border-focus-200/80 dark:border-focus-800" 
          />
          <div>
            <span className="font-black text-base sm:text-lg text-warm-900 dark:text-warm-100 tracking-tight block leading-tight">
              Pomo-Dino Focus
            </span>
            <span className="text-xs text-warm-500 font-medium">
              Calm & Single-Tasking
            </span>
          </div>
        </div>
        <span className="text-xs sm:text-sm font-bold text-warm-500 dark:text-warm-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Hero Briefing Card (Faithfully modeled after the bottom-right card in reference photo) */}
      <div className="rounded-[28px] p-5 bg-gradient-to-br from-[#122b52] via-[#1d4ed8] to-[#0ea5e9] text-white shadow-lifted border border-white/20 relative overflow-hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">
            Today's Briefing
          </span>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white">
            {resolvedCount}/{totalBlocks} Resolved
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
          Good {timeOfDayGreeting}, Focus Hero!
        </h1>

        <p className="text-xs sm:text-sm text-cyan-50 font-medium leading-relaxed">
          You have <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 font-black">📋 {totalBlocks} routine blocks</span> planned for today{currentBlock ? <>, with <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 font-black">🔥 {currentBlock.name}</span> right now</> : ''}. Ready to begin? 🚀
        </p>
      </div>

      {/* Progress strip */}
      <ProgressStrip blocks={routineBlocks} dailyLog={dailyLog} />

      {/* 1. EARLIER TODAY CATCH-UP (Positioned right above Right Now) */}
      {pastUncompletedBlocks.length > 0 && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-3xl p-4 space-y-2.5 shadow-soft animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-600" />
              <span>Earlier today — did you finish these?</span>
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              {pastUncompletedBlocks.length} to check off
            </span>
          </div>

          <div className="space-y-2">
            {pastUncompletedBlocks.map((block) => (
              <div 
                key={block.id} 
                className="p-3.5 bg-white dark:bg-warm-850 rounded-2xl border border-amber-200/70 dark:border-warm-800 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-warm-900 dark:text-warm-100 truncate">
                    {block.name}
                  </p>
                  <span className="text-[11px] capitalize px-2 py-0.5 rounded-md bg-warm-100 dark:bg-warm-800 text-warm-600 font-medium">
                    {block.category}
                  </span>
                </div>

                {/* Dual Column Start / Finish Layout matching reference card */}
                <div className="flex items-center justify-between pt-1 border-t border-amber-100 dark:border-warm-800">
                  <div className="flex items-center gap-4 text-xs font-bold text-warm-500">
                    <div>
                      <span className="text-[10px] text-warm-400 uppercase block">Start</span>
                      <span className="font-mono text-sm text-warm-800 dark:text-warm-200">{block.startTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-warm-400 uppercase block">Finish</span>
                      <span className="font-mono text-sm text-warm-800 dark:text-warm-200">{block.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDone(block.id)}
                      className="min-h-[38px] px-3.5 py-1.5 bg-focus-600 hover:bg-focus-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Done</span>
                    </button>
                    <button
                      onClick={() => handleSkip(block.id)}
                      className="min-h-[38px] px-2.5 py-1.5 bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 text-warm-600 dark:text-warm-300 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MAIN FOCUS: RIGHT NOW TASK (With Start / Finish Dual Column Layout) */}
      <div>
        {currentBlock ? (
          <div className="relative glass-card rounded-[32px] p-5 border border-white/70 dark:border-white/10 shadow-lifted transition-all space-y-3">
            {/* Active Tag with Confident Accent */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-focus-100 dark:bg-focus-900/50 text-focus-800 dark:text-focus-300 border border-focus-200/60 dark:border-focus-800/60">
                <span className="w-2 h-2 rounded-full bg-focus-600 dark:bg-focus-500 animate-pulse" />
                Right Now
              </span>

              <span className="text-xs font-bold text-warm-600 dark:text-warm-400 capitalize px-2.5 py-0.5 rounded-xl bg-warm-100 dark:bg-warm-800 border border-warm-200/60 dark:border-warm-700">
                {currentBlock.category}
              </span>
            </div>

            {/* Block Name */}
            <h2 className="text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 tracking-tight leading-tight">
              {currentBlock.name}
            </h2>

            {/* Dual Column Start & Finish Display (Directly from reference design) */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-warm-100/70 dark:bg-warm-900/60 border border-warm-200/60 dark:border-warm-800">
              <div>
                <span className="text-[11px] font-bold text-warm-500 dark:text-warm-400 uppercase tracking-wider block">
                  Start
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-warm-900 dark:text-warm-100 block mt-0.5">
                  {currentBlock.startTime}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-warm-500 dark:text-warm-400 uppercase tracking-wider block">
                  Finish
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-focus-600 dark:text-focus-400 block mt-0.5">
                  {currentBlock.endTime}
                </span>
              </div>
            </div>

            {/* First 10-minute step if set */}
            {currentBlock.firstStep ? (
              <div className="p-3 bg-warm-50/90 dark:bg-warm-900 rounded-2xl border border-warm-200/70 dark:border-warm-800 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-focus-700 dark:text-focus-400 uppercase tracking-wider">
                    First 10-min step
                  </p>
                  <p className="text-sm text-warm-800 dark:text-warm-200 mt-1 leading-snug">
                    {currentBlock.firstStep}
                  </p>
                </div>
                <button
                  onClick={() => onOpenBreakdown(currentBlock)}
                  className="text-xs font-semibold text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 shrink-0 p-1"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenBreakdown(currentBlock)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-warm-600 dark:text-warm-400 hover:text-focus-600 dark:hover:text-focus-400 transition-colors py-1 font-medium"
              >
                <Split className="w-4 h-4 text-focus-500" />
                <span>Break it down (first 10-minute step)</span>
              </button>
            )}

            {/* Current Block Action Status */}
            {currentStatus === 'done' ? (
              <div className="mt-3 p-3.5 bg-leaf-50 dark:bg-leaf-950/40 border border-leaf-300 dark:border-leaf-800 rounded-2xl flex items-center justify-between text-leaf-800 dark:text-leaf-300 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-leaf-600" />
                  <span>Marked Done for this block</span>
                </div>
                <button
                  onClick={() => onMarkBlockStatus(currentBlock.id, 'pending')}
                  className="text-xs underline text-leaf-700 hover:text-leaf-900"
                >
                  Undo
                </button>
              </div>
            ) : currentStatus === 'skipped' ? (
              <div className="mt-3 p-3.5 bg-warm-100 dark:bg-warm-800 rounded-2xl flex items-center justify-between text-warm-700 dark:text-warm-300 font-medium text-sm">
                <span>Moved past for now</span>
                <button
                  onClick={() => onMarkBlockStatus(currentBlock.id, 'done')}
                  className="px-3 py-1.5 rounded-xl bg-focus-600 text-white text-xs font-bold"
                >
                  Change to Done
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => handleSkip(currentBlock.id)}
                  className="flex items-center justify-center gap-2 min-h-[52px] px-4 py-3 rounded-2xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-700 dark:text-warm-300 font-bold text-base transition-all active:scale-[0.98]"
                >
                  <FastForward className="w-4 h-4 text-warm-500" />
                  <span>Skip</span>
                </button>

                <button
                  onClick={() => handleDone(currentBlock.id)}
                  className="flex items-center justify-center gap-2 min-h-[52px] px-4 py-3 rounded-2xl bg-focus-600 hover:bg-focus-700 text-white font-bold text-base shadow-lifted transition-all active:scale-[0.98]"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>Done</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-7 px-4 glass-card rounded-3xl border border-white/60 dark:border-warm-800 shadow-soft">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-warm-900 dark:text-warm-100">
              {isAllDayResolved ? 'All routine blocks done today!' : 'Between scheduled blocks'}
            </h2>
            <p className="text-xs sm:text-sm text-warm-500 dark:text-warm-400 mt-1 max-w-xs mx-auto">
              {isAllDayResolved
                ? 'Great rhythm today. Relax or head to Review whenever you are ready.'
                : 'Take a breath or capture thoughts in the to-do list below.'}
            </p>
          </div>
        )}
      </div>

      {/* 3. PRIORITY-BASED TO-DOS */}
      <PriorityCard
        priority={dailyLog.priority}
        onUpdatePriority={onUpdatePriority}
      />

      <AdditionalTodosSection
        todos={todos}
        onToggleTodo={onToggleTodo}
        onAddTodo={onAddTodo}
        onChangeTodoPriority={onChangeTodoPriority}
        onDeleteTodo={onDeleteTodo}
      />

      {/* 4. MOTIVATIONAL DREAM REDIRECTION BANNER */}
      {onNavigateToLearning && (
        <div 
          onClick={onNavigateToLearning}
          className="cursor-pointer bg-gradient-to-r from-focus-50 via-warm-50 to-leaf-50 dark:from-warm-850 dark:to-warm-900 rounded-2xl p-4 border border-focus-200/90 dark:border-focus-800/60 shadow-soft hover:border-focus-400 transition-all flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-focus-100 dark:bg-focus-950/80 text-focus-700 dark:text-focus-300 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 text-focus-600 dark:text-focus-400" />
            </div>
            <div>
              {dreamAssessment ? (
                <>
                  <p className="text-[11px] font-bold text-focus-700 dark:text-focus-400 uppercase tracking-wider">
                    My Life Target & Dream
                  </p>
                  <h3 className="text-sm sm:text-base font-bold text-warm-900 dark:text-warm-100 leading-snug">
                    {dreamAssessment.dreamTitle}
                  </h3>
                </>
              ) : (
                <>
                  <h3 className="text-sm sm:text-base font-bold text-warm-900 dark:text-warm-100">
                    Take assessment to achieve your dream
                  </h3>
                  <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                    Build your custom weekly target & learning roadmap
                  </p>
                </>
              )}
            </div>
          </div>
          <span className="text-sm font-bold text-focus-600 dark:text-focus-400 group-hover:translate-x-0.5 transition-transform shrink-0 pl-2">
            {dreamAssessment ? 'Roadmap →' : 'Start →'}
          </span>
        </div>
      )}

      {/* Next Block */}
      <div>
        {nextBlock ? (
          <div className="bg-warm-100/70 dark:bg-warm-900/70 rounded-2xl p-3.5 border border-warm-200/60 dark:border-warm-800/60 transition-colors">
            <div className="flex items-center justify-between text-xs text-warm-500 dark:text-warm-400 mb-0.5">
              <span className="font-bold uppercase tracking-wider">Coming Up Next</span>
              <span className="font-semibold">{formatTimeRange(nextBlock.startTime, nextBlock.endTime)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm sm:text-base font-bold text-warm-800 dark:text-warm-200">
                {nextBlock.name}
              </p>
              <span className="text-xs capitalize px-2 py-0.5 rounded-md bg-warm-200/70 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-medium">
                {nextBlock.category}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-warm-400 py-1 font-medium">
            No further blocks scheduled for today.
          </div>
        )}
      </div>

      {/* Expandable Today's Schedule (Check off any task anytime) */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft overflow-hidden">
        <button
          onClick={() => setShowFullSchedule((prev) => !prev)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-warm-50/70 dark:hover:bg-warm-800/40 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-focus-600" />
            <span className="text-xs sm:text-sm font-bold text-warm-900 dark:text-warm-100">
              Today's Full Routine ({resolvedCount}/{totalBlocks} Resolved)
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-500 font-semibold">
            <span>{showFullSchedule ? 'Hide' : 'View All'}</span>
            {showFullSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showFullSchedule && (
          <div className="px-3.5 pb-3.5 pt-1 divide-y divide-warm-100 dark:divide-warm-800/60 space-y-2">
            {routineBlocks.map((b) => {
              const status = dailyLog.blockStatus[b.id] || 'pending';
              const isCurrent = currentBlock?.id === b.id;

              return (
                <div key={b.id} className="pt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-warm-900 dark:text-warm-100">
                        {b.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-focus-100 text-focus-700 dark:bg-focus-950 dark:text-focus-300 animate-pulse">
                          Right Now
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-warm-500">
                      {formatTimeRange(b.startTime, b.endTime)} • <span className="capitalize">{b.category}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {status === 'done' ? (
                      <button
                        onClick={() => onMarkBlockStatus(b.id, 'pending')}
                        className="px-2.5 py-1.5 rounded-xl bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300 text-xs font-bold flex items-center gap-1"
                        title="Tap to undo"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDone(b.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-focus-600 hover:bg-focus-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs"
                        >
                          Done
                        </button>
                        <button
                          onClick={() => handleSkip(b.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 text-warm-600 dark:text-warm-300 text-xs font-medium"
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
