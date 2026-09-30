import React, { useState, useEffect } from 'react';
import type { AppData, DailyLog, ReviewWhyReason, ReviewMood } from '../types';
import { generateClaudeDailyAnalysis } from '../lib/claudeExport';
import { getRoutineBlocksForDate, getCompletedTodosForDate } from '../lib/storage';
import { ART, HeroBanner, Page } from '../components/ui';
import {
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Bot,
  DollarSign,
  FileText,
  CheckSquare,
} from 'lucide-react';

interface EveningReviewScreenProps {
  appData: AppData;
  dailyLog: DailyLog;
  onSaveReview: (updatedLog: Partial<DailyLog>) => void;
}

const MOODS: { id: ReviewMood; label: string; emoji: string; circle: string }[] = [
  { id: 'great', label: 'Great', emoji: '😄', circle: 'bg-honey-300 dark:bg-honey-500/40' },
  { id: 'good', label: 'Good', emoji: '🙂', circle: 'bg-forest-200 dark:bg-forest-500/40' },
  { id: 'okay', label: 'Okay', emoji: '😐', circle: 'bg-honey-200 dark:bg-honey-600/30' },
  { id: 'tough', label: 'Tough', emoji: '😣', circle: 'bg-rose-200 dark:bg-rose-500/30' },
];

const WHY_REASONS: { id: Exclude<ReviewWhyReason, null>; label: string }[] = [
  { id: 'too_big', label: 'Too big' },
  { id: 'bored', label: 'Bored' },
  { id: 'no_time', label: 'No time' },
  { id: 'forgot', label: 'Forgot' },
  { id: 'low_energy', label: 'Low energy' },
  { id: 'other', label: 'Other' },
];

const INPUT_CLASS =
  'w-full bg-warm-50 dark:bg-warm-900 text-warm-800 dark:text-warm-100 placeholder:text-warm-400 text-[13px] rounded-xl px-3 py-2.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-500 focus:ring-2 focus:ring-focus-500/20 resize-none';

export const EveningReviewScreen: React.FC<EveningReviewScreenProps> = ({
  appData,
  dailyLog,
  onSaveReview,
}) => {
  const activeBlocks = getRoutineBlocksForDate(appData, new Date());
  const completedTodosToday = getCompletedTodosForDate(appData.todos, dailyLog.date);

  const doneBlockNames = activeBlocks
    .filter((b) => dailyLog.blockStatus[b.id] === 'done')
    .map((b) => b.name);

  const slippedBlockNames = activeBlocks
    .filter((b) => dailyLog.blockStatus[b.id] === 'skipped')
    .map((b) => b.name);

  const initialGotDone = [
    ...doneBlockNames,
    ...completedTodosToday.map((t) => `[${t.priority}] ${t.text}`),
  ].join(', ');

  const [whatGotDone, setWhatGotDone] = useState(dailyLog.reviewWhatGotDone || initialGotDone);
  const [whatSlipped, setWhatSlipped] = useState(
    dailyLog.reviewWhatSlipped || slippedBlockNames.join(', ')
  );
  const [whyReason, setWhyReason] = useState<ReviewWhyReason>(dailyLog.reviewWhy);
  const [mood, setMood] = useState<ReviewMood | null>(dailyLog.mood ?? null);
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
    if (dailyLog.mood) setMood(dailyLog.mood);
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
      mood,
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
        mood,
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
    <Page>
      {/* Night hero header */}
      <HeroBanner src={ART.eveningHero} fade={false} className="h-[150px]">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="relative px-5 pt-4 safe-top">
          <h1 className="text-[24px] leading-tight font-extrabold tracking-tight text-white drop-shadow">
            Evening Review
          </h1>
        </div>
      </HeroBanner>

      {/* Overlapping review sheet */}
      <section className="card relative z-20 -mt-6 rounded-t-[28px] rounded-b-[22px] mx-0 px-5 pt-5 pb-5 space-y-4">
        <div>
          <h2 className="text-[17px] font-bold text-warm-800 dark:text-warm-50">How did your day go?</h2>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">A quick 1-minute reflection</p>
        </div>

        {/* Mood row */}
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Mood">
          {MOODS.map((m) => {
            const selected = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMood(selected ? null : m.id)}
                className="flex flex-col items-center gap-1.5 py-1 rounded-2xl active:scale-95 transition-transform"
              >
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-[24px] leading-none transition-all ${m.circle} ${
                    selected ? 'ring-2 ring-focus-500 ring-offset-2 ring-offset-[#FFFCF6] dark:ring-offset-warm-900' : ''
                  }`}
                >
                  {m.emoji}
                </span>
                <span
                  className={`text-xs ${
                    selected ? 'font-bold text-warm-800 dark:text-warm-50' : 'font-medium text-warm-500 dark:text-warm-400'
                  }`}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* What got done */}
        <div>
          <label htmlFor="review-done" className="block text-[13px] font-bold text-warm-800 dark:text-warm-100 mb-1.5">
            What got done?
          </label>
          <textarea
            id="review-done"
            rows={2}
            value={whatGotDone}
            onChange={(e) => setWhatGotDone(e.target.value)}
            placeholder="e.g. Completed workout, finished API, read book..."
            className={INPUT_CLASS}
          />
          {completedTodosToday.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-forest-500 dark:text-forest-400 flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                To-dos finished
              </span>
              {completedTodosToday.map((t) => (
                <span
                  key={t.id}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-medium"
                >
                  [{t.priority}] {t.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* What slipped */}
        <div>
          <label htmlFor="review-slipped" className="block text-[13px] font-bold text-warm-800 dark:text-warm-100 mb-1.5">
            What slipped?
          </label>
          <textarea
            id="review-slipped"
            rows={2}
            value={whatSlipped}
            onChange={(e) => setWhatSlipped(e.target.value)}
            placeholder="e.g. Didn't do evening workout..."
            className={INPUT_CLASS}
          />
        </div>

        {/* Why */}
        <div>
          <p className="text-[13px] font-bold text-warm-800 dark:text-warm-100 mb-2">Why did it slip?</p>
          <div className="grid grid-cols-3 gap-2">
            {WHY_REASONS.map((item) => {
              const selected = whyReason === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setWhyReason(selected ? null : item.id)}
                  className={`rounded-full px-2 py-2 text-xs font-semibold border transition-all active:scale-95 ${
                    selected
                      ? 'bg-honey-100 dark:bg-honey-500/20 border-honey-400 text-warm-800 dark:text-honey-200'
                      : 'bg-warm-50 dark:bg-warm-900 border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <div>
          <button type="button" onClick={handleSave} className="btn-primary w-full min-h-[48px] text-[15px]">
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved for today!</span>
              </>
            ) : (
              <span>Save Review</span>
            )}
          </button>
          {dailyLog.reviewCompletedAt && !savedSuccess && (
            <p className="text-center text-[11px] text-warm-400 dark:text-warm-500 mt-1.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-honey-500" />
              Reviewed earlier today
            </p>
          )}
        </div>
      </section>

      <div className="px-4 mt-3 space-y-2.5">
        {/* Spending check-in */}
        <div className="card px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="w-4 h-4 text-focus-600 shrink-0" />
            <span className="text-[13px] font-semibold text-warm-800 dark:text-warm-100">
              Did today match your spending plan?
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSpendingMatched(spendingMatched === true ? null : true)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                spendingMatched === true
                  ? 'bg-forest-500 text-white'
                  : 'bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setSpendingMatched(spendingMatched === false ? null : false)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                spendingMatched === false
                  ? 'bg-focus-600 text-white'
                  : 'bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Free-form notes */}
        <div className="card px-4 py-3">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-between text-[13px] font-semibold text-warm-800 dark:text-warm-100"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-warm-500" />
              Anything else? (stray thoughts, notes)
            </span>
            {showNotes ? <ChevronUp className="w-4 h-4 text-warm-500" /> : <ChevronDown className="w-4 h-4 text-warm-500" />}
          </button>
          {showNotes && (
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Unstructured thoughts, how you felt, stray reflections..."
              className={`${INPUT_CLASS} mt-2.5`}
            />
          )}
        </div>

        {/* Claude export */}
        <div className="card px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-focus-100 dark:bg-focus-900/50 text-focus-600 dark:text-focus-300 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-warm-800 dark:text-warm-100">Claude Daily Analysis</h2>
                <p className="text-[11px] text-warm-500 dark:text-warm-400">Paste directly into your Claude project</p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-honey-100 dark:bg-honey-500/20 text-warm-700 dark:text-honey-200">
              EOD Sync
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleCopyClaude}
              className={`flex-1 flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-full text-xs font-bold transition-all active:scale-95 ${
                copiedClaude ? 'bg-forest-500 text-white' : 'bg-warm-800 dark:bg-warm-100 text-white dark:text-warm-900'
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
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-3 rounded-full text-xs font-semibold text-warm-600 dark:text-warm-300 bg-warm-100 dark:bg-warm-800"
            >
              <span>{showPreview ? 'Hide' : 'Preview'}</span>
              {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showPreview && (
            <div className="mt-2.5 pt-2.5 border-t border-warm-200 dark:border-warm-800">
              <div className="flex items-center justify-between text-[10px] text-warm-400 mb-1">
                <span>Markdown Preview:</span>
                <button type="button" onClick={handleCopyClaude} className="text-focus-600 dark:text-focus-400 font-semibold">
                  {copiedClaude ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-[10px] leading-relaxed bg-warm-800 text-warm-100 dark:bg-warm-950 p-3 rounded-xl overflow-x-auto max-h-48 whitespace-pre-wrap font-mono select-text">
                {claudeMarkdown}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};
