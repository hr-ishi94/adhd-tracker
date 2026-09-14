import React, { useState } from 'react';
import type { Sprint } from '../types';
import { 
  Milestone, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Plus, 
  Check, 
  Edit3 
} from 'lucide-react';

interface RoadmapScreenProps {
  sprints: Sprint[];
  onUpdateSprints: (sprints: Sprint[]) => void;
  onBack: () => void;
}

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({
  sprints,
  onUpdateSprints,
  onBack,
}) => {
  const [editingNoteSprintId, setEditingNoteSprintId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const calculateDaysRemaining = (startDateStr: string | null, weeks: number): { daysRemaining: number; totalDays: number } => {
    const totalDays = weeks * 7;
    if (!startDateStr) return { daysRemaining: totalDays, totalDays };
    const start = new Date(startDateStr);
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - elapsedDays);
    return { daysRemaining, totalDays };
  };

  const handleCompleteSprint = (sprintId: string) => {
    const index = sprints.findIndex((s) => s.id === sprintId);
    if (index === -1) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const updated = sprints.map((s, i) => {
      if (i === index) {
        return { ...s, status: 'done' as const };
      }
      // Activate next upcoming sprint automatically
      if (i === index + 1 && s.status === 'upcoming') {
        return { ...s, status: 'active' as const, startDate: todayStr };
      }
      return s;
    });

    onUpdateSprints(updated);
  };

  const handleSaveNote = (sprintId: string) => {
    const updated = sprints.map((s) =>
      s.id === sprintId ? { ...s, note: noteText.trim() } : s
    );
    onUpdateSprints(updated);
    setEditingNoteSprintId(null);
    setNoteText('');
  };

  const handleStartEditingNote = (s: Sprint) => {
    setEditingNoteSprintId(s.id);
    setNoteText(s.note || '');
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-3.5 pt-2 pb-24 safe-top space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 px-0.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-warm-500 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-warm-900 dark:text-warm-100 flex items-center gap-2 leading-tight">
              <Milestone className="w-4 h-4 text-focus-600" />
              <span>Sprint Roadmap</span>
            </h1>
            <p className="text-[11px] text-warm-500 dark:text-warm-400">
              2-week curriculum plan • Weekly check-in view
            </p>
          </div>
        </div>
      </div>

      {/* Sprints List */}
      <div className="space-y-2">
        {sprints.map((sprint, index) => {
          const isActive = sprint.status === 'active';
          const isDone = sprint.status === 'done';
          const { daysRemaining, totalDays } = calculateDaysRemaining(sprint.startDate, sprint.durationWeeks);

          let cardStyle = 'bg-white dark:bg-warm-850 border-warm-200/90 dark:border-warm-800';
          if (isActive) {
            cardStyle = 'bg-white dark:bg-warm-850 border-focus-400 dark:border-focus-600 shadow-md ring-1 ring-focus-400/30';
          } else if (isDone) {
            cardStyle = 'bg-warm-100/60 dark:bg-warm-900/40 border-warm-200/50 dark:border-warm-800/50 opacity-75';
          }

          return (
            <div
              key={sprint.id}
              className={`rounded-xl p-3.5 border transition-all ${cardStyle}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span className="w-5 h-5 rounded-md bg-warm-100 dark:bg-warm-800 flex items-center justify-center text-[10px] text-warm-600 dark:text-warm-400 font-bold">
                    {index + 1}
                  </span>
                  <span className="text-warm-500 dark:text-warm-400">
                    {sprint.durationWeeks} weeks
                  </span>
                </div>

                <div>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-focus-100 dark:bg-focus-950 text-focus-800 dark:text-focus-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-focus-600 animate-pulse" />
                      Active Sprint
                    </span>
                  )}
                  {isDone && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warm-200/70 dark:bg-warm-800 text-warm-600 dark:text-warm-400">
                      <Check className="w-2.5 h-2.5" />
                      Completed
                    </span>
                  )}
                  {sprint.status === 'upcoming' && (
                    <span className="text-[10px] font-medium text-warm-400 uppercase tracking-wider px-1.5 py-0.5">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-sm font-bold text-warm-900 dark:text-warm-100 leading-snug">
                {sprint.name}
              </h2>

              {isActive && (
                <div className="mt-2.5 pt-2 border-t border-warm-100 dark:border-warm-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-warm-500 dark:text-warm-400">
                    <Clock className="w-3.5 h-3.5 text-focus-600" />
                    <span>
                      <strong className="text-warm-900 dark:text-warm-100">{daysRemaining}</strong> days remaining of {totalDays}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCompleteSprint(sprint.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-focus-600 hover:bg-focus-700 text-white rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                </div>
              )}

              {/* Sprint Retrospective / Note */}
              {sprint.note && editingNoteSprintId !== sprint.id && (
                <div className="mt-2 p-2 rounded-lg bg-warm-50 dark:bg-warm-900 border border-warm-200/60 dark:border-warm-800 flex items-start justify-between gap-2 text-xs">
                  <p className="text-warm-700 dark:text-warm-300 italic">
                    "{sprint.note}"
                  </p>
                  <button
                    onClick={() => handleStartEditingNote(sprint)}
                    className="text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 shrink-0 p-0.5"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {!sprint.note && !isActive && !isDone && (
                <div className="mt-1" />
              )}

              {(isDone || isActive) && !sprint.note && editingNoteSprintId !== sprint.id && (
                <button
                  onClick={() => handleStartEditingNote(sprint)}
                  className="mt-2 text-[11px] text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add note on how it went</span>
                </button>
              )}

              {editingNoteSprintId === sprint.id && (
                <div className="mt-2 p-2 rounded-lg bg-warm-50 dark:bg-warm-900 border border-warm-300 dark:border-warm-700 space-y-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="One line: how did this sprint go?"
                    autoFocus
                    className="w-full bg-white dark:bg-warm-800 text-xs rounded px-2.5 py-1.5 border border-warm-200 dark:border-warm-700 focus:outline-none focus:border-focus-600"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingNoteSprintId(null)}
                      className="text-[11px] px-2 py-1 text-warm-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveNote(sprint.id)}
                      className="text-[11px] px-2.5 py-1 bg-warm-900 dark:bg-warm-100 text-white dark:text-warm-900 rounded font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
