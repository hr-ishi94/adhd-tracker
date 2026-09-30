import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { RoutineBlock, DailyLog, Streak, TodoItem, PomodoroStats, Category } from '../types';
import { getLastNDays, formatDayLabel, getWeekKey } from '../lib/time';
import { getSittingTodosOver7Days } from '../lib/storage';
import { ART, CoinIcon, Page, ProgressBar, ScreenHeader } from '../components/ui';
import {
  Flame,
  PauseCircle,
  Calendar,
  Save,
  Check,
  Minus,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  BookOpen,
  Briefcase,
  User,
  Map as MapIcon,
} from 'lucide-react';

interface WeeklyRetroScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLogs: Record<string, DailyLog>;
  streak: Streak;
  weeklyRetroNotes: Record<string, string>;
  todos?: TodoItem[];
  pomodoroStats?: PomodoroStats;
  onSaveRetroNote: (weekKey: string, note: string) => void;
  onAcknowledgeSittingTodo?: (todoId: string, action: 'keep' | 'demote' | 'done' | 'delete') => void;
  onOpenRoadmap?: () => void;
}

const FOCUS_MINUTES_FALLBACK = 25;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_GROUPS: {
  id: string;
  label: string;
  cats: Category[];
  Icon: React.FC<{ className?: string }>;
  iconBg: string;
  bar: string;
}[] = [
  { id: 'health', label: 'Health & Fitness', cats: ['gym'], Icon: Dumbbell, iconBg: 'bg-forest-100 text-forest-600 dark:bg-forest-900/60 dark:text-forest-300', bar: 'bg-forest-500' },
  { id: 'learning', label: 'Learning', cats: ['learning'], Icon: BookOpen, iconBg: 'bg-forest-50 text-forest-400 dark:bg-forest-900/40 dark:text-forest-300', bar: 'bg-forest-300' },
  { id: 'work', label: 'Work', cats: ['office'], Icon: Briefcase, iconBg: 'bg-focus-100 text-focus-600 dark:bg-focus-900/50 dark:text-focus-300', bar: 'bg-focus-500' },
  { id: 'personal', label: 'Personal', cats: ['personal', 'project'], Icon: User, iconBg: 'bg-honey-100 text-honey-500 dark:bg-honey-500/20 dark:text-honey-300', bar: 'bg-honey-400' },
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shortDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export const WeeklyRetroScreen: React.FC<WeeklyRetroScreenProps> = ({
  routineBlocks,
  dailyLogs,
  streak,
  weeklyRetroNotes,
  todos = [],
  pomodoroStats,
  onSaveRetroNote,
  onAcknowledgeSittingTodo,
  onOpenRoadmap,
}) => {
  const currentWeekKey = getWeekKey();
  const [note, setNote] = useState(weeklyRetroNotes[currentWeekKey] || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showPattern, setShowPattern] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const sittingTodos = getSittingTodosOver7Days(todos, currentWeekKey);

  useEffect(() => {
    setNote(weeklyRetroNotes[currentWeekKey] || '');
  }, [currentWeekKey, weeklyRetroNotes]);

  const handleSaveNote = () => {
    onSaveRetroNote(currentWeekKey, note);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const focusNote = () => {
    noteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    noteRef.current?.focus({ preventScroll: true });
  };

  // Sunday-to-Saturday week, shifted by weekOffset
  const todayStr = toDateStr(new Date());
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
    return d;
  }, [weekOffset]);
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);
  const weekDays = useMemo(() => getLastNDays(7, weekEnd), [weekEnd]);

  const stats = useMemo(() => {
    const blockCategory = new Map(routineBlocks.map((b) => [b.id, b.category]));
    const catTotals: Record<string, { done: number; total: number }> = {};
    CATEGORY_GROUPS.forEach((g) => (catTotals[g.id] = { done: 0, total: 0 }));
    const groupFor = (cat?: Category) => CATEGORY_GROUPS.find((g) => cat && g.cats.includes(cat))?.id;

    let coins = 0;
    const days = weekDays.map((dateStr) => {
      const log = dailyLogs[dateStr];
      const isFuture = dateStr > todayStr;
      // Completed todos for this day (live list + log snapshot, de-duplicated)
      const todoMap = new Map<string, TodoItem>();
      (log?.completedTodos || []).forEach((t) => todoMap.set(t.id, t));
      todos.filter((t) => t.status === 'done' && t.completedDate === dateStr).forEach((t) => todoMap.set(t.id, t));
      const doneTodos = [...todoMap.values()];
      doneTodos.forEach((t) => (coins += t.coins ?? 0));

      let blocksDone = 0;
      let blocksTotal = 0;
      if (log) {
        const ids = new Set([...routineBlocks.map((b) => b.id), ...Object.keys(log.blockStatus || {})]);
        ids.forEach((id) => {
          const status = log.blockStatus?.[id];
          blocksTotal += 1;
          if (status === 'done') blocksDone += 1;
          const g = groupFor(blockCategory.get(id));
          if (g) {
            catTotals[g].total += 1;
            if (status === 'done') catTotals[g].done += 1;
          }
        });
      }

      const done = blocksDone + doneTodos.length;
      const total = blocksTotal + doneTodos.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { dateStr, done, total, pct, isFuture };
    });

    const done = days.reduce((s, d) => s + d.done, 0);
    const total = days.reduce((s, d) => s + d.total, 0);
    const best = days.reduce((b, d, i) => (d.pct > (days[b]?.pct ?? -1) ? i : b), 0);
    return { days, done, total, coins, best: days[best]?.pct > 0 ? best : -1, catTotals };
  }, [weekDays, dailyLogs, routineBlocks, todos, todayStr]);

  const focusMinutes = (pomodoroStats?.totalCompleted ?? 0) * FOCUS_MINUTES_FALLBACK;
  const focusLabel = focusMinutes >= 60 ? `${Math.round(focusMinutes / 60)}h` : `${focusMinutes}m`;

  const last7Days = getLastNDays(7);
  const yesterdayStr = last7Days[last7Days.length - 2];
  const isStreakActive = streak.lastCompletedDate === todayStr || streak.lastCompletedDate === yesterdayStr;
  const daysSinceCompleted = streak.lastCompletedDate
    ? Math.floor((new Date(todayStr).getTime() - new Date(streak.lastCompletedDate).getTime()) / 86400000)
    : 0;

  const weekLabel = `${shortDate(weekStart)} – ${shortDate(weekEnd)}`;

  return (
    <Page>
      <ScreenHeader
        title="Weekly Progress"
        right={
          <button
            type="button"
            onClick={focusNote}
            aria-label="Add retro note"
            className="w-9 h-9 rounded-full bg-[#FFFCF6] dark:bg-warm-800 border border-warm-200 dark:border-warm-700 text-warm-800 dark:text-warm-100 flex items-center justify-center shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-4 space-y-3">
        {/* Week switcher */}
        <div className="flex items-center gap-2 -mt-1">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
            className="p-1 rounded-full text-warm-600 dark:text-warm-300 hover:bg-warm-200/60 dark:hover:bg-warm-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-semibold text-warm-700 dark:text-warm-200">{weekLabel}</span>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={weekOffset >= 0}
            aria-label="Next week"
            className="p-1 rounded-full text-warm-600 dark:text-warm-300 hover:bg-warm-200/60 dark:hover:bg-warm-800 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bar chart */}
        <div className="card p-4">
          <div className="flex justify-end">
            <div className="text-right rounded-xl bg-warm-50 dark:bg-warm-900 border border-warm-200/80 dark:border-warm-800 px-2.5 py-1">
              <div className="text-[15px] font-extrabold text-warm-800 dark:text-warm-50 leading-tight">
                {stats.done} / {stats.total}
              </div>
              <div className="text-[10px] text-warm-500 dark:text-warm-400">tasks completed</div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2 items-end h-32">
            {stats.days.map((d, i) => {
              const h = d.total > 0 ? Math.max(8, d.pct) : 6;
              const color = d.total === 0 ? 'bg-warm-200 dark:bg-warm-800' : i % 2 === 0 ? 'bg-forest-400' : 'bg-honey-400';
              return (
                <div key={d.dateStr} className="relative h-full flex items-end justify-center" title={`${d.dateStr}: ${d.done}/${d.total}`}>
                  <div className={`relative w-full max-w-[26px] rounded-t-lg ${color}`} style={{ height: `${h}%` }}>
                    {i === stats.best && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white dark:bg-warm-700 text-[10px] font-bold text-warm-800 dark:text-warm-50 shadow-md whitespace-nowrap">
                        {d.pct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-1.5 text-center">
            {stats.days.map((d) => {
              const isToday = d.dateStr === todayStr;
              return (
                <span
                  key={d.dateStr}
                  className={`text-[11px] ${isToday ? 'font-bold text-focus-600' : 'font-medium text-warm-500 dark:text-warm-400'}`}
                >
                  {formatDayLabel(d.dateStr).dayName.charAt(0)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Stats tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="card px-3 py-2.5">
            <CoinIcon className="w-6 h-6" />
            <div className="text-[17px] font-extrabold text-warm-800 dark:text-warm-50 mt-1 leading-tight">{stats.coins}</div>
            <div className="text-[10px] text-warm-500 dark:text-warm-400">Coins earned</div>
          </div>
          <div className="card px-3 py-2.5">
            <Flame className="w-6 h-6 text-focus-500" />
            <div className="text-[17px] font-extrabold text-warm-800 dark:text-warm-50 mt-1 leading-tight">{streak.current}</div>
            <div className="text-[10px] text-warm-500 dark:text-warm-400">Day streak</div>
            {!isStreakActive && streak.current > 0 && daysSinceCompleted > 1 && (
              <div className="mt-1 inline-flex items-center gap-0.5 text-[9px] text-warm-500">
                <PauseCircle className="w-2.5 h-2.5 text-focus-600" />
                {daysSinceCompleted}d paused
              </div>
            )}
          </div>
          <div className="card px-3 py-2.5">
            <Clock className="w-6 h-6 text-sky-500" />
            <div className="text-[17px] font-extrabold text-warm-800 dark:text-warm-50 mt-1 leading-tight">{focusLabel}</div>
            <div className="text-[10px] text-warm-500 dark:text-warm-400">Focus time</div>
          </div>
        </div>

        {/* Quote card */}
        <div className="card-honey relative overflow-hidden flex items-end justify-between pl-4 pr-2 pt-3 min-h-[72px]">
          <p className="self-center text-[15px] font-bold text-warm-800 dark:text-honey-100 pb-3">
            “Progress, not perfection.”
          </p>
          <img src={ART.quoteMascot} alt="" aria-hidden="true" className="w-[60px] h-auto object-contain select-none" />
        </div>

        {/* Top categories */}
        <div className="card p-4">
          <h2 className="text-[15px] font-bold text-warm-800 dark:text-warm-50 mb-3">Top Categories</h2>
          <div className="space-y-3">
            {CATEGORY_GROUPS.map((g) => {
              const t = stats.catTotals[g.id];
              const pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
              return (
                <div key={g.id} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${g.iconBg}`}>
                    <g.Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-warm-800 dark:text-warm-100 mb-1">{g.label}</div>
                    <ProgressBar value={pct} className="h-2.5 bg-warm-100 dark:bg-warm-800" barClassName={g.bar} />
                  </div>
                  <span className="w-10 text-right text-[13px] font-bold text-warm-700 dark:text-warm-200">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Block pattern (last 7 days, colorblind-safe shapes) */}
        <div className="card px-4 py-3">
          <button
            type="button"
            onClick={() => setShowPattern(!showPattern)}
            className="w-full flex items-center justify-between text-[13px] font-semibold text-warm-800 dark:text-warm-100"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-warm-500" />
              Last 7 days block pattern
            </span>
            {showPattern ? <ChevronUp className="w-4 h-4 text-warm-500" /> : <ChevronDown className="w-4 h-4 text-warm-500" />}
          </button>
          {showPattern && (
            <div className="mt-3">
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5 pb-1 border-b border-warm-100 dark:border-warm-800">
                {last7Days.map((dateStr) => {
                  const { dayName, dayNumber, isToday } = formatDayLabel(dateStr);
                  return (
                    <div key={dateStr} className={`py-0.5 rounded ${isToday ? 'text-focus-600 font-bold' : 'text-warm-500'}`}>
                      <div className="text-[9px]">{dayName}</div>
                      <div className="text-xs font-medium">{dayNumber}</div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                {routineBlocks.map((block) => (
                  <div key={block.id}>
                    <div className="flex items-center justify-between text-[11px] text-warm-700 dark:text-warm-300 font-medium mb-0.5">
                      <span className="truncate pr-1">{block.name}</span>
                      <span className="text-[9px] text-warm-400 shrink-0">{block.startTime}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {last7Days.map((dateStr) => {
                        const status = dailyLogs[dateStr]?.blockStatus[block.id];
                        let cls = 'bg-warm-100 dark:bg-warm-900 border border-warm-200 dark:border-warm-800';
                        let content: React.ReactNode = null;
                        if (status === 'done') {
                          cls = 'bg-forest-500 text-white';
                          content = <Check className="w-2.5 h-2.5 stroke-[3]" />;
                        } else if (status === 'skipped') {
                          cls = 'bg-warm-200 dark:bg-warm-700 border border-dashed border-warm-400 text-warm-600 dark:text-warm-300';
                          content = <Minus className="w-2.5 h-2.5 stroke-[3]" />;
                        }
                        return (
                          <div
                            key={dateStr}
                            title={`${block.name} on ${dateStr}: ${status || 'none'}`}
                            className={`h-5 rounded-md flex items-center justify-center ${cls}`}
                          >
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7+ day sitting to-dos */}
        {sittingTodos.length > 0 && (
          <div className="card p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warm-500" />
              <h2 className="text-[13px] font-bold text-warm-800 dark:text-warm-100">Sitting a while — still relevant?</h2>
            </div>
            <p className="text-[11px] text-warm-500 dark:text-warm-400">
              These tasks have been here for 7+ days. Priorities change naturally — keep, demote to C, mark done, or let go with zero guilt.
            </p>
            <div className="space-y-2">
              {sittingTodos.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-2xl bg-warm-50 dark:bg-warm-900 border border-warm-200/70 dark:border-warm-800 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 bg-honey-100 dark:bg-honey-500/20 text-warm-800 dark:text-honey-200">
                      {item.priority}
                    </span>
                    <span className="text-xs font-medium text-warm-800 dark:text-warm-200 truncate">{item.text}</span>
                  </div>
                  {onAcknowledgeSittingTodo && (
                    <div className="flex flex-wrap items-center gap-1.5 self-end text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => onAcknowledgeSittingTodo(item.id, 'keep')}
                        title="Keep as is for now"
                        className="px-2.5 py-1 rounded-full bg-warm-200/70 dark:bg-warm-800 text-warm-700 dark:text-warm-300"
                      >
                        Still needed
                      </button>
                      {item.priority !== 'C' && (
                        <button
                          type="button"
                          onClick={() => onAcknowledgeSittingTodo(item.id, 'demote')}
                          title="Demote to C (nice to have)"
                          className="px-2.5 py-1 rounded-full bg-honey-100 dark:bg-honey-500/20 text-warm-800 dark:text-honey-200"
                        >
                          Demote to C
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onAcknowledgeSittingTodo(item.id, 'done')}
                        title="Mark done"
                        className="px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-900/50 text-forest-600 dark:text-forest-300 flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" />
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => onAcknowledgeSittingTodo(item.id, 'delete')}
                        title="Let go guilt-free"
                        className="px-2.5 py-1 rounded-full text-warm-400 hover:text-rose-500"
                      >
                        Let go
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retro note */}
        <div className="card p-4">
          <label htmlFor="retro-note" className="block text-[13px] font-bold text-warm-800 dark:text-warm-100">
            What do I want to change next week?
          </label>
          <p className="text-[11px] text-warm-500 dark:text-warm-400 mb-2">One small experiment or adjustment to test.</p>
          <textarea
            id="retro-note"
            ref={noteRef}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Move evening side project 30 mins earlier to avoid late fatigue..."
            className="w-full bg-warm-50 dark:bg-warm-900 text-warm-800 dark:text-warm-100 placeholder:text-warm-400 text-[13px] rounded-xl px-3 py-2.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-500 focus:ring-2 focus:ring-focus-500/20 resize-none"
          />
          <div className="flex justify-end mt-2.5">
            <button type="button" onClick={handleSaveNote} className="btn-primary px-4 py-2 text-xs">
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved note</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Retro Note</span>
                </>
              )}
            </button>
          </div>
        </div>

        {onOpenRoadmap && (
          <button
            type="button"
            onClick={onOpenRoadmap}
            className="card w-full px-4 py-3 flex items-center justify-between text-[13px] font-semibold text-warm-800 dark:text-warm-100 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-focus-600" />
              Open learning roadmap
            </span>
            <ChevronRight className="w-4 h-4 text-warm-500" />
          </button>
        )}
      </div>
    </Page>
  );
};
