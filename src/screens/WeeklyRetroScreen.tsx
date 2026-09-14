import React, { useState, useEffect } from 'react';
import type { RoutineBlock, DailyLog, Streak } from '../types';
import { getLastNDays, formatDayLabel, getWeekKey } from '../lib/time';
import { Flame, PauseCircle, Calendar, Save, Check, Minus } from 'lucide-react';

interface WeeklyRetroScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLogs: Record<string, DailyLog>;
  streak: Streak;
  weeklyRetroNotes: Record<string, string>;
  onSaveRetroNote: (weekKey: string, note: string) => void;
  onOpenRoadmap?: () => void;
}

export const WeeklyRetroScreen: React.FC<WeeklyRetroScreenProps> = ({
  routineBlocks,
  dailyLogs,
  streak,
  weeklyRetroNotes,
  onSaveRetroNote,
  onOpenRoadmap,
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

  const todayStr = last7Days[last7Days.length - 1];
  const yesterdayStr = last7Days[last7Days.length - 2];
  const isStreakActive = streak.lastCompletedDate === todayStr || streak.lastCompletedDate === yesterdayStr;
  const daysSinceCompleted = streak.lastCompletedDate
    ? Math.floor((new Date(todayStr).getTime() - new Date(streak.lastCompletedDate).getTime()) / 86400000)
    : 0;

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-3.5 pt-2 pb-24 safe-top space-y-2.5">
      {/* Screen Header */}
      <div className="flex items-center justify-between mb-0.5 px-0.5">
        <div>
          <h1 className="text-xl font-bold text-warm-900 dark:text-warm-100">
            Weekly Retro
          </h1>
          <p className="text-[11px] text-warm-500 dark:text-warm-400">
            A pattern view, not a grade • Notice rhythms neutrally
          </p>
        </div>
        {onOpenRoadmap && (
          <button
            onClick={onOpenRoadmap}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-focus-100 dark:bg-focus-950 text-focus-700 dark:text-focus-300 hover:bg-focus-200 transition-colors"
          >
            Roadmap →
          </button>
        )}
      </div>

      {/* Streak Header */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-warm-900 dark:text-warm-100 leading-none">
                  {streak.current}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-500">
                  {streak.current === 1 ? 'day streak' : 'days streak'}
                </span>
              </div>
              <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
                Personal best: {streak.best} days
              </p>
            </div>
          </div>

          {!isStreakActive && streak.current > 0 && daysSinceCompleted > 1 && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-warm-500 bg-warm-100 dark:bg-warm-800 px-2 py-1 rounded-lg">
              <PauseCircle className="w-3 h-3 text-focus-600" />
              <span>{daysSinceCompleted}d paused</span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-warm-400 dark:text-warm-500 mt-2 pt-1.5 border-t border-warm-100 dark:border-warm-800">
          Missed days pause your streak without resetting it to zero.
        </p>
      </div>

      {/* 7-Day Pattern View with P2 #9 Colorblind-safe shapes */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-warm-500 dark:text-warm-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last 7 Days Pattern</span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-warm-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-focus-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span> Done
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-warm-200 dark:bg-warm-700 text-warm-600 dark:text-warm-300 flex items-center justify-center text-[8px] font-bold">-</span> Skipped
            </span>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5 pb-1 border-b border-warm-100 dark:border-warm-800">
          {last7Days.map((dateStr) => {
            const { dayName, dayNumber, isToday } = formatDayLabel(dateStr);
            return (
              <div
                key={dateStr}
                className={`py-0.5 rounded ${isToday ? 'bg-focus-50 dark:bg-focus-950/40 text-focus-700 dark:text-focus-400 font-bold' : 'text-warm-500'}`}
              >
                <div className="text-[9px]">{dayName}</div>
                <div className="text-xs font-medium">{dayNumber}</div>
              </div>
            );
          })}
        </div>

        {/* Routine Blocks Rows */}
        <div className="space-y-2 mt-1.5">
          {routineBlocks.map((block) => (
            <div key={block.id} className="text-xs">
              <div className="flex items-center justify-between text-warm-700 dark:text-warm-300 font-medium mb-0.5 truncate">
                <span className="truncate pr-1 text-[11px]">{block.name}</span>
                <span className="text-[9px] text-warm-400 font-normal shrink-0">{block.startTime}</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {last7Days.map((dateStr) => {
                  const log = dailyLogs[dateStr];
                  const status = log ? log.blockStatus[block.id] : undefined;

                  let dotClass = 'bg-warm-100 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 text-warm-400';
                  let content = null;

                  if (status === 'done') {
                    dotClass = 'bg-focus-600 text-white';
                    content = <Check className="w-2.5 h-2.5 stroke-[3]" />;
                  } else if (status === 'skipped') {
                    dotClass = 'bg-warm-200 dark:bg-warm-700 border-dashed border-warm-400 text-warm-600 dark:text-warm-300';
                    content = <Minus className="w-2.5 h-2.5 stroke-[3]" />;
                  }

                  return (
                    <div
                      key={dateStr}
                      title={`${block.name} on ${dateStr}: ${status || 'none'}`}
                      className={`h-5 rounded flex items-center justify-center text-[10px] transition-all ${dotClass}`}
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

      {/* Free-text box: What do I want to change next week? */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <label className="block text-xs font-bold text-warm-900 dark:text-warm-100 mb-0.5">
          What do I want to change next week?
        </label>
        <p className="text-[11px] text-warm-500 dark:text-warm-400 mb-1.5">
          One small experiment or adjustment to test.
        </p>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Move evening side project 30 mins earlier to avoid late fatigue..."
          className="w-full bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-xs sm:text-sm rounded-lg p-2.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600 dark:focus:border-focus-500 resize-none"
        />

        <div className="flex justify-end mt-2">
          <button
            onClick={handleSaveNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-900 dark:bg-warm-100 hover:bg-warm-800 dark:hover:bg-white text-white dark:text-warm-900 text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3 h-3" />
                <span>Saved note</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                <span>Save Retro Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
