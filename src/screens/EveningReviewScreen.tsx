import React, { useState, useEffect } from 'react';
import type { RoutineBlock, DailyLog, ReviewWhyReason } from '../types';
import { Moon, CheckCircle2, Save, Sparkles } from 'lucide-react';

interface EveningReviewScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLog: DailyLog;
  onSaveReview: (updatedLog: Partial<DailyLog>) => void;
}

const WHY_REASONS: { id: ReviewWhyReason; label: string; icon: string }[] = [
  { id: 'too_big', label: 'Too big', icon: '🐘' },
  { id: 'bored', label: 'Bored / Understimulated', icon: '🥱' },
  { id: 'no_time', label: 'No time / Interrupted', icon: '⏳' },
  { id: 'forgot', label: 'Forgot / Switched context', icon: '🌀' },
  { id: 'low_energy', label: 'Low energy', icon: '🔋' },
];

export const EveningReviewScreen: React.FC<EveningReviewScreenProps> = ({
  routineBlocks,
  dailyLog,
  onSaveReview,
}) => {
  // Auto-fill Done items from routine block status
  const doneBlockNames = routineBlocks
    .filter((b) => dailyLog.blockStatus[b.id] === 'done')
    .map((b) => b.name);

  // Auto-fill Slipped items from routine block status
  const slippedBlockNames = routineBlocks
    .filter((b) => dailyLog.blockStatus[b.id] === 'skipped')
    .map((b) => b.name);

  const [whatGotDone, setWhatGotDone] = useState(
    dailyLog.reviewWhatGotDone || doneBlockNames.join(', ')
  );
  const [whatSlipped, setWhatSlipped] = useState(
    dailyLog.reviewWhatSlipped || slippedBlockNames.join(', ')
  );
  const [whyReason, setWhyReason] = useState<ReviewWhyReason>(dailyLog.reviewWhy);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // If dailyLog updates from outside
    if (dailyLog.reviewWhatGotDone) setWhatGotDone(dailyLog.reviewWhatGotDone);
    if (dailyLog.reviewWhatSlipped) setWhatSlipped(dailyLog.reviewWhatSlipped);
    if (dailyLog.reviewWhy) setWhyReason(dailyLog.reviewWhy);
  }, [dailyLog]);

  const handleSave = () => {
    onSaveReview({
      reviewWhatGotDone: whatGotDone,
      reviewWhatSlipped: whatSlipped,
      reviewWhy: whyReason,
      reviewCompletedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-24 safe-top">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-400 rounded-2xl">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-100">
            Evening Review
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400">
            3 fast questions • Less than 60 seconds • Zero shame
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Question 1: What got done today? */}
        <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft">
          <label className="block text-sm font-semibold text-warm-900 dark:text-warm-100 mb-1">
            1. What got done today?
          </label>
          <p className="text-xs text-warm-500 dark:text-warm-400 mb-2">
            Auto-filled from today's completed blocks. Feel free to edit or add.
          </p>
          <textarea
            rows={2}
            value={whatGotDone}
            onChange={(e) => setWhatGotDone(e.target.value)}
            placeholder="e.g. Morning DSA sprint, system design notes..."
            className="w-full bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-sm rounded-xl p-3 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
          />
        </div>

        {/* Question 2: What slipped? */}
        <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft">
          <label className="block text-sm font-semibold text-warm-900 dark:text-warm-100 mb-1">
            2. What slipped?
          </label>
          <p className="text-xs text-warm-500 dark:text-warm-400 mb-2">
            A miss just happens. Notice it neutrally.
          </p>
          <textarea
            rows={2}
            value={whatSlipped}
            onChange={(e) => setWhatSlipped(e.target.value)}
            placeholder="e.g. Side project session..."
            className="w-full bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-sm rounded-xl p-3 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
          />
        </div>

        {/* Question 3: Why? (Quick-select chips: tap, don't type) */}
        <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft">
          <label className="block text-sm font-semibold text-warm-900 dark:text-warm-100 mb-1">
            3. Why?
          </label>
          <p className="text-xs text-warm-500 dark:text-warm-400 mb-3">
            Tap the primary friction reason (no need to write an essay):
          </p>
          <div className="flex flex-wrap gap-2">
            {WHY_REASONS.map((item) => {
              const isSelected = whyReason === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWhyReason(isSelected ? null : item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-focus-600 text-white shadow-sm ring-2 ring-focus-600/30 font-semibold'
                      : 'bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Review Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3 px-4 bg-warm-900 dark:bg-warm-100 hover:bg-warm-800 dark:hover:bg-white text-white dark:text-warm-900 rounded-2xl font-semibold text-sm transition-all shadow-md active:scale-[0.99]"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-focus-400" />
                <span>Saved for today!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Today's Log</span>
              </>
            )}
          </button>

          {dailyLog.reviewCompletedAt && !savedSuccess && (
            <p className="text-center text-[11px] text-warm-400 dark:text-warm-500 mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-focus-600" />
              Reviewed earlier today
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
