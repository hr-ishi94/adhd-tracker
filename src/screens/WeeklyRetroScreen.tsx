import React, { useState, useEffect } from 'react';
import type { RoutineBlock, DailyLog, Streak } from '../types';
import { getLastNDays, formatDayLabel, getWeekKey } from '../lib/time';
import { Flame, PauseCircle, Calendar, Save, Check } from 'lucide-react';

interface WeeklyRetroScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLogs: Record<string, DailyLog>;
  streak: Streak;
  weeklyRetroNotes: Record<string, string>;
  onSaveRetroNote: (weekKey: string, note: string) => void;
}

export const WeeklyRetroScreen: React.FC<WeeklyRetroScreenProps> = ({
  routineBlocks,
  dailyLogs,
  streak,
  weeklyRetroNotes,
  onSaveRetroNote,
}) => {
  const currentWeekKey = getWeekKey();
  const [note, setNote] = useState(weeklyRetroNotes[currentWeekKey] || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setNote(weeklyRetroNotes[currentWeekKey] || '');
  }, [currentWeekKey, weeklyRetroNotes]);

  const last7Days = getLastNDays(7);

  const handleSaveNote = () => {
    onSaveRetroNote(currentWeekKey, note);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Streak pause calculation
  // If lastCompletedDate was before yesterday and streak > 0, streak is paused
  const todayStr = last7Days[last7Days.length - 1];
  const yesterdayStr = last7Days[last7Days.length - 2];
  const isStreakActive = streak.lastCompletedDate === todayStr || streak.lastCompletedDate === yesterdayStr;
  const daysSinceCompleted = streak.lastCompletedDate
    ? Math.floor((new Date(todayStr).getTime() - new Date(streak.lastCompletedDate).getTime()) / 86400000)
    : 0;

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-24 safe-top">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-100">
            Weekly Retro
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400">
            A pattern view, not a grade • Notice rhythms neutrally
          </p>
        </div>
      </div>

      {/* Streak Header: Pauses, never shames (SPEC §4.7) */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-warm-900 dark:text-warm-100">
                  {streak.current}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-warm-500">
                  {streak.current === 1 ? 'day streak' : 'days streak'}
                </span>
              </div>
              <p className="text-xs text-warm-500 dark:text-warm-400">
                Personal best: {streak.best} days
              </p>
            </div>
          </div>

          {!isStreakActive && streak.current > 0 && daysSinceCompleted > 1 && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-warm-500 bg-warm-100 dark:bg-warm-800 px-2.5 py-1.5 rounded-xl">
              <PauseCircle className="w-3.5 h-3.5 text-focus-600" />
              <span>{daysSinceCompleted}d paused</span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-warm-400 dark:text-warm-500 mt-2.5 pt-2 border-t border-warm-100 dark:border-warm-800">
          Missed days pause your streak without resetting it to zero.
        </p>
      </div>

      {/* 7-Day Pattern View (SPEC §4.6) */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-500 dark:text-warm-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last 7 Days Pattern</span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-warm-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-focus-500" /> Done
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warm-300 dark:bg-warm-700" /> Skipped
            </span>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2 pb-1 border-b border-warm-100 dark:border-warm-800">
          {last7Days.map((dateStr) => {
            const { dayName, dayNumber, isToday } = formatDayLabel(dateStr);
            return (
              <div
                key={dateStr}
                className={`py-1 rounded-lg ${isToday ? 'bg-focus-50 dark:bg-focus-950/40 text-focus-700 dark:text-focus-400 font-bold' : 'text-warm-500'}`}
              >
                <div className="text-[10px]">{dayName}</div>
                <div className="text-xs font-medium">{dayNumber}</div>
              </div>
            );
          })}
        </div>

        {/* Routine Blocks Rows */}
        <div className="space-y-2.5 mt-2">
          {routineBlocks.map((block) => (
            <div key={block.id} className="text-xs">
              <div className="flex items-center justify-between text-warm-700 dark:text-warm-300 font-medium mb-1 truncate">
                <span className="truncate pr-1">{block.name}</span>
                <span className="text-[10px] text-warm-400 font-normal shrink-0">{block.startTime}</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {last7Days.map((dateStr) => {
                  const log = dailyLogs[dateStr];
                  const status = log ? log.blockStatus[block.id] : undefined;

                  let dotClass = 'bg-warm-100 dark:bg-warm-900 border border-warm-200 dark:border-warm-800';
                  if (status === 'done') {
                    dotClass = 'bg-focus-500 text-white';
                  } else if (status === 'skipped') {
                    dotClass = 'bg-warm-300 dark:bg-warm-700';
                  }

                  return (
                    <div
                      key={dateStr}
                      title={`${block.name} on ${dateStr}: ${status || 'none'}`}
                      className={`h-6 rounded-lg flex items-center justify-center text-[10px] transition-all ${dotClass}`}
                    >
                      {status === 'done' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free-text box: What do I want to change next week? (SPEC §4.6) */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <label className="block text-sm font-semibold text-warm-900 dark:text-warm-100 mb-1">
          What do I want to change next week?
        </label>
        <p className="text-xs text-warm-500 dark:text-warm-400 mb-2">
          One small experiment or adjustment to test.
        </p>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Move evening side project 30 mins earlier to avoid late fatigue..."
          className="w-full bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-sm rounded-xl p-3 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
        />

        <div className="flex justify-end mt-3">
          <button
            onClick={handleSaveNote}
            className="flex items-center gap-1.5 px-4 py-2 bg-warm-900 dark:bg-warm-100 hover:bg-warm-800 dark:hover:bg-white text-white dark:text-warm-900 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
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
    </div>
  );
};
