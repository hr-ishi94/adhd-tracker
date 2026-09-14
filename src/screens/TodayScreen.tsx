import React from 'react';
import type { RoutineBlock, DailyLog, BlockStatus } from '../types';
import { formatTimeRange } from '../lib/time';
import { PriorityCard } from '../components/PriorityCard';
import { ProgressStrip } from '../components/ProgressStrip';
import { Check, FastForward, Split, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLog: DailyLog;
  currentBlock: RoutineBlock | null;
  nextBlock: RoutineBlock | null;
  onUpdatePriority: (newPriority: string) => void;
  onMarkBlockStatus: (blockId: string, status: BlockStatus) => void;
  onOpenBreakdown: (block: RoutineBlock) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  routineBlocks,
  dailyLog,
  currentBlock,
  nextBlock,
  onUpdatePriority,
  onMarkBlockStatus,
  onOpenBreakdown,
}) => {
  const currentStatus = currentBlock ? dailyLog.blockStatus[currentBlock.id] || 'pending' : 'pending';

  // Check if all blocks today are completed/resolved
  const totalBlocks = routineBlocks.length;
  let resolvedCount = 0;
  routineBlocks.forEach((b) => {
    const s = dailyLog.blockStatus[b.id];
    if (s === 'done' || s === 'skipped') resolvedCount++;
  });
  const isAllDayResolved = totalBlocks > 0 && resolvedCount === totalBlocks;

  const triggerQuietCelebration = () => {
    // Respects prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // Quiet, elegant confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D97706', '#F59E0B', '#EBE6DC'],
      disableForReducedMotion: true,
    });
  };

  const handleDone = (blockId: string) => {
    onMarkBlockStatus(blockId, 'done');
    // If this completed the final block
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

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top">
      {/* Top Section: Brand Header, Progress strip and Priority Card */}
      <div className="w-full">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="ADHD Tracker Logo" 
              className="w-7 h-7 rounded-lg object-contain shadow-soft border border-warm-200/60 dark:border-warm-800" 
            />
            <span className="font-bold text-sm text-warm-900 dark:text-warm-100 tracking-tight">
              Daily Focus
            </span>
          </div>
          <span className="text-[11px] font-medium text-warm-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <ProgressStrip blocks={routineBlocks} dailyLog={dailyLog} />
        <PriorityCard
          priority={dailyLog.priority}
          onUpdatePriority={onUpdatePriority}
        />
      </div>

      {/* Main Focus: Current Block (Large & Centered) */}
      <div className="flex-1 flex flex-col justify-center my-auto py-4">
        {currentBlock ? (
          <div className="relative bg-white dark:bg-warm-850 rounded-3xl p-6 sm:p-7 border border-warm-200/90 dark:border-warm-800 shadow-lifted transition-all">
            {/* Active Tag with Confident Accent */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-focus-100 dark:bg-focus-900/50 text-focus-800 dark:text-focus-300 border border-focus-200/60 dark:border-focus-800/60">
                <span className="w-2 h-2 rounded-full bg-focus-600 dark:bg-focus-500 animate-pulse" />
                Right Now
              </span>

              <span className="text-xs font-medium text-warm-500 dark:text-warm-400 capitalize px-2.5 py-0.5 rounded-lg bg-warm-100 dark:bg-warm-800">
                {currentBlock.category}
              </span>
            </div>

            {/* Time range */}
            <p className="text-sm font-semibold text-warm-500 dark:text-warm-400 tracking-tight">
              {formatTimeRange(currentBlock.startTime, currentBlock.endTime)}
            </p>

            {/* Block Name: Single largest, boldest thing on screen (SPEC §8) */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-warm-900 dark:text-warm-100 mt-2 mb-3 tracking-tight leading-tight">
              {currentBlock.name}
            </h1>

            {/* First 10-minute step if set */}
            {currentBlock.firstStep ? (
              <div className="my-3 p-3 bg-warm-50 dark:bg-warm-900 rounded-xl border border-warm-200/70 dark:border-warm-800 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-focus-700 dark:text-focus-400 uppercase tracking-wider">
                    First 10-min step
                  </p>
                  <p className="text-xs sm:text-sm text-warm-800 dark:text-warm-200 mt-0.5">
                    {currentBlock.firstStep}
                  </p>
                </div>
                <button
                  onClick={() => onOpenBreakdown(currentBlock)}
                  className="text-xs text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 shrink-0"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenBreakdown(currentBlock)}
                className="inline-flex items-center gap-1.5 text-xs text-warm-500 dark:text-warm-400 hover:text-focus-600 dark:hover:text-focus-400 transition-colors my-2"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Break it down (first 10-minute step)</span>
              </button>
            )}

            {/* Current Block Action Status */}
            {currentStatus === 'done' ? (
              <div className="mt-5 p-3.5 bg-warm-100 dark:bg-warm-800 rounded-2xl flex items-center justify-center gap-2 text-warm-700 dark:text-warm-300 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 text-focus-600" />
                <span>Marked Done for this block</span>
                <button
                  onClick={() => onMarkBlockStatus(currentBlock.id, 'pending')}
                  className="text-xs underline ml-2 text-warm-500 hover:text-warm-800"
                >
                  Undo
                </button>
              </div>
            ) : currentStatus === 'skipped' ? (
              <div className="mt-5 p-3.5 bg-warm-100 dark:bg-warm-800 rounded-2xl flex items-center justify-center gap-2 text-warm-600 dark:text-warm-400 font-medium text-sm">
                <span>Moved past for now</span>
                <button
                  onClick={() => onMarkBlockStatus(currentBlock.id, 'pending')}
                  className="text-xs underline ml-2 text-warm-500 hover:text-warm-800"
                >
                  Undo
                </button>
              </div>
            ) : (
              /* One primary action per block: Done / Skip (SPEC §4.1) */
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => handleSkip(currentBlock.id)}
                  className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-2xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-700 dark:text-warm-300 font-semibold text-sm transition-all active:scale-[0.98]"
                >
                  <FastForward className="w-4 h-4 text-warm-500" />
                  <span>Skip</span>
                </button>

                <button
                  onClick={() => handleDone(currentBlock.id)}
                  className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-2xl bg-focus-600 hover:bg-focus-700 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Between blocks or Day completed */
          <div className="text-center py-8 px-6 bg-white dark:bg-warm-850 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-warm-900 dark:text-warm-100">
              {isAllDayResolved ? 'All blocks accounted for today' : 'Between routine blocks'}
            </h2>
            <p className="text-xs sm:text-sm text-warm-500 dark:text-warm-400 mt-1 max-w-xs mx-auto">
              {isAllDayResolved
                ? 'Great rhythm today. Head over to Review whenever you are ready.'
                : 'Take a breath or use the brain dump to capture stray ideas.'}
            </p>
          </div>
        )}
      </div>

      {/* Next Block: Small, below (SPEC §4.1) */}
      <div className="w-full mt-auto pt-2">
        {nextBlock ? (
          <div className="bg-warm-100/70 dark:bg-warm-900/70 rounded-2xl p-4 border border-warm-200/60 dark:border-warm-800/60 transition-colors">
            <div className="flex items-center justify-between text-xs text-warm-500 dark:text-warm-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Coming Up Next</span>
              <span>{formatTimeRange(nextBlock.startTime, nextBlock.endTime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-warm-800 dark:text-warm-200">
                {nextBlock.name}
              </p>
              <span className="text-[11px] capitalize px-2 py-0.5 rounded bg-warm-200/70 dark:bg-warm-800 text-warm-600 dark:text-warm-400">
                {nextBlock.category}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-warm-400 py-2">
            No further blocks scheduled for today.
          </div>
        )}
      </div>
    </div>
  );
};
