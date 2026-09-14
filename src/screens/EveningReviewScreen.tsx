import React, { useState, useEffect } from 'react';
import type { AppData, DailyLog, ReviewWhyReason } from '../types';
import { generateClaudeDailyAnalysis } from '../lib/claudeExport';
import { getRoutineBlocksForDate } from '../lib/storage';
import { 
  Moon, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Bot,
  DollarSign,
  FileText
} from 'lucide-react';

interface EveningReviewScreenProps {
  appData: AppData;
  dailyLog: DailyLog;
  onSaveReview: (updatedLog: Partial<DailyLog>) => void;
}

const WHY_REASONS: { id: ReviewWhyReason; label: string; icon: string }[] = [
  { id: 'too_big', label: 'Too big', icon: '🐘' },
  { id: 'bored', label: 'Bored / Dopamine', icon: '🥱' },
  { id: 'no_time', label: 'No time / Cut short', icon: '⏳' },
  { id: 'forgot', label: 'Forgot / Switched', icon: '🌀' },
  { id: 'low_energy', label: 'Low energy', icon: '🔋' },
];

export const EveningReviewScreen: React.FC<EveningReviewScreenProps> = ({
  appData,
  dailyLog,
  onSaveReview,
}) => {
  const activeBlocks = getRoutineBlocksForDate(appData, new Date());

  const doneBlockNames = activeBlocks
    .filter((b) => dailyLog.blockStatus[b.id] === 'done')
    .map((b) => b.name);

  const slippedBlockNames = activeBlocks
    .filter((b) => dailyLog.blockStatus[b.id] === 'skipped')
    .map((b) => b.name);

  const [whatGotDone, setWhatGotDone] = useState(
    dailyLog.reviewWhatGotDone || doneBlockNames.join(', ')
  );
  const [whatSlipped, setWhatSlipped] = useState(
    dailyLog.reviewWhatSlipped || slippedBlockNames.join(', ')
  );
  const [whyReason, setWhyReason] = useState<ReviewWhyReason>(dailyLog.reviewWhy);
  const [notes, setNotes] = useState(dailyLog.notes || '');
  const [showNotes, setShowNotes] = useState(Boolean(dailyLog.notes));
  const [spendingMatched, setSpendingMatched] = useState<boolean | null>(
    dailyLog.spendingPlanMatched ?? null
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedClaude, setCopiedClaude] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (dailyLog.reviewWhatGotDone) setWhatGotDone(dailyLog.reviewWhatGotDone);
    if (dailyLog.reviewWhatSlipped) setWhatSlipped(dailyLog.reviewWhatSlipped);
    if (dailyLog.reviewWhy) setWhyReason(dailyLog.reviewWhy);
    if (dailyLog.notes) {
      setNotes(dailyLog.notes);
      setShowNotes(true);
    }
    if (dailyLog.spendingPlanMatched !== undefined) {
      setSpendingMatched(dailyLog.spendingPlanMatched);
    }
  }, [dailyLog]);

  const handleSave = () => {
    onSaveReview({
      reviewWhatGotDone: whatGotDone,
      reviewWhatSlipped: whatSlipped,
      reviewWhy: whyReason,
      notes: notes.trim(),
      spendingPlanMatched: spendingMatched,
      reviewCompletedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const liveAppData: AppData = {
    ...appData,
    dailyLogs: {
      ...appData.dailyLogs,
      [dailyLog.date]: {
        ...dailyLog,
        reviewWhatGotDone: whatGotDone,
        reviewWhatSlipped: whatSlipped,
        reviewWhy: whyReason,
        notes: notes.trim(),
        spendingPlanMatched: spendingMatched,
      },
    },
  };

  const claudeMarkdown = generateClaudeDailyAnalysis(liveAppData, dailyLog.date);

  const handleCopyClaude = async () => {
    try {
      await navigator.clipboard.writeText(claudeMarkdown);
      setCopiedClaude(true);
      setTimeout(() => setCopiedClaude(false), 3000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = claudeMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedClaude(true);
      setTimeout(() => setCopiedClaude(false), 3000);
    }
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-3.5 pt-2 pb-24 safe-top space-y-2.5">
      {/* Screen Header */}
      <div className="flex items-center gap-2.5 mb-1 px-0.5">
        <div className="p-2 bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-400 rounded-xl">
          <Moon className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-warm-900 dark:text-warm-100 leading-tight">
            Evening Review
          </h1>
          <p className="text-[11px] text-warm-500 dark:text-warm-400">
            3 fast questions • Less than 60s • Claude sync
          </p>
        </div>
      </div>

      {/* Question 1: What got done today? */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <label className="block text-xs font-bold text-warm-900 dark:text-warm-100 mb-0.5">
          1. What got done today?
        </label>
        <p className="text-[11px] text-warm-500 dark:text-warm-400 mb-1.5">
          Auto-filled from today's completed blocks.
        </p>
        <textarea
          rows={2}
          value={whatGotDone}
          onChange={(e) => setWhatGotDone(e.target.value)}
          placeholder="e.g. Morning DSA sprint, system design notes..."
          className="w-full bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-xs sm:text-sm rounded-lg p-2.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
        />
      </div>

      {/* Question 2: What slipped? */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <label className="block text-xs font-bold text-warm-900 dark:text-warm-100 mb-0.5">
          2. What slipped?
        </label>
        <p className="text-[11px] text-warm-500 dark:text-warm-400 mb-1.5">
          Notice it neutrally without guilt.
        </p>
        <textarea
          rows={2}
          value={whatSlipped}
          onChange={(e) => setWhatSlipped(e.target.value)}
          placeholder="e.g. Side project session..."
          className="w-full bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-xs sm:text-sm rounded-lg p-2.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
        />
      </div>

      {/* Question 3: Why? */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <label className="block text-xs font-bold text-warm-900 dark:text-warm-100 mb-0.5">
          3. Why?
        </label>
        <p className="text-[11px] text-warm-500 dark:text-warm-400 mb-2">
          Tap the friction trigger:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {WHY_REASONS.map((item) => {
            const isSelected = whyReason === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setWhyReason(isSelected ? null : item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

      {/* P2 #8: Financial Check-In (Minimal single toggle) */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-focus-600" />
            <label className="text-xs font-bold text-warm-900 dark:text-warm-100">
              Did today match your spending plan?
            </label>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSpendingMatched(spendingMatched === true ? null : true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                spendingMatched === true
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setSpendingMatched(spendingMatched === false ? null : false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                spendingMatched === false
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* P1 #7: Free-form Daily Notes (Collapsed by default, zero friction) */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="w-full flex items-center justify-between text-xs font-bold text-warm-800 dark:text-warm-200"
        >
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-warm-500" />
            <span>Anything else? (stray thoughts, notes)</span>
          </div>
          {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showNotes && (
          <div className="mt-2 pt-2 border-t border-warm-100 dark:border-warm-800 animate-in fade-in duration-150">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Unstructured thoughts, how you felt, stray reflections..."
              className="w-full bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-xs sm:text-sm rounded-lg p-2.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
            />
          </div>
        )}
      </div>

      {/* Save Review Button */}
      <div>
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-4 bg-warm-900 dark:bg-warm-100 hover:bg-warm-800 dark:hover:bg-white text-white dark:text-warm-900 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-[0.99]"
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
          <p className="text-center text-[10px] text-warm-400 dark:text-warm-500 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-focus-600" />
            Reviewed earlier today
          </p>
        )}
      </div>

      {/* Claude ADHD Project Analysis Export */}
      <div className="bg-gradient-to-b from-white to-warm-50 dark:from-warm-850 dark:to-warm-900 rounded-xl p-3 border border-focus-200/80 dark:border-focus-900/50 shadow-soft transition-all">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-focus-100 dark:bg-focus-900/60 text-focus-700 dark:text-focus-300">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-warm-900 dark:text-warm-100">
                Claude Daily Analysis
              </h2>
              <p className="text-[10px] text-warm-500 dark:text-warm-400">
                Paste directly into Claude ADHD Project
              </p>
            </div>
          </div>
          <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-focus-100 dark:bg-focus-950 text-focus-800 dark:text-focus-300">
            EOD Sync
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleCopyClaude}
            className={`flex-1 flex items-center justify-center gap-1.5 min-h-[40px] py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
              copiedClaude
                ? 'bg-emerald-600 text-white'
                : 'bg-focus-600 hover:bg-focus-700 text-white'
            }`}
          >
            {copiedClaude ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Analysis for Claude</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 rounded-lg bg-warm-100 dark:bg-warm-800 transition-colors"
          >
            <span>{showPreview ? 'Hide' : 'Preview'}</span>
            {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showPreview && (
          <div className="mt-2 pt-2 border-t border-warm-200 dark:border-warm-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[10px] text-warm-400 mb-1">
              <span>Markdown Preview:</span>
              <button
                onClick={handleCopyClaude}
                className="text-focus-600 dark:text-focus-400 hover:underline font-semibold"
              >
                {copiedClaude ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-[10px] leading-relaxed bg-warm-900 text-warm-100 dark:bg-warm-950 p-3 rounded-lg overflow-x-auto max-h-48 whitespace-pre-wrap font-mono select-text border border-warm-800">
              {claudeMarkdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
