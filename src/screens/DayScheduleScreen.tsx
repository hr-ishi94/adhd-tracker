import React, { useState } from 'react';
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Heart,
  Moon,
  Plus,
  Rocket,
  Sparkles,
} from 'lucide-react';
import type { BlockStatus, Category, DailyLog, RoutineBlock } from '../types';
import { getBlockSubtasks } from '../lib/storage';
import { formatTimeRange, timeToMinutes } from '../lib/time';
import { Checkbox, Page, ScreenHeader } from '../components/ui';

interface DayScheduleScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLog: DailyLog;
  currentBlock: RoutineBlock | null;
  currentTime: Date;
  onToggleSubtask: (blockId: string, index: number) => void;
  onAddSubtask: (blockId: string, text: string) => void;
  onMarkBlockStatus: (blockId: string, status: BlockStatus) => void;
  onOpenBreakdown: (block: RoutineBlock) => void;
  onBack: () => void;
}

const CATEGORY_STYLE: Record<Category, { icon: React.ElementType; tile: string }> = {
  gym: { icon: Dumbbell, tile: 'bg-forest-100 text-forest-700 dark:bg-forest-900/60 dark:text-forest-300' },
  office: { icon: Briefcase, tile: 'bg-[#E4E9DF] text-[#56675A] dark:bg-forest-900/40 dark:text-forest-300' },
  learning: { icon: BookOpen, tile: 'bg-honey-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  personal: { icon: Heart, tile: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300' },
  review: { icon: Moon, tile: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300' },
  sleep: { icon: Moon, tile: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300' },
  project: { icon: Rocket, tile: 'bg-focus-100 text-focus-600 dark:bg-focus-900/40 dark:text-focus-300' },
};

export const DayScheduleScreen: React.FC<DayScheduleScreenProps> = ({
  routineBlocks,
  dailyLog,
  currentBlock,
  currentTime,
  onToggleSubtask,
  onAddSubtask,
  onMarkBlockStatus,
  onOpenBreakdown,
  onBack,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(currentBlock ? [currentBlock.id] : []));
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const weekday = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
  const dayMonth = currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const [mon, day] = dayMonth.split(' ');
  const title = `Today · ${weekday}, ${day ?? ''} ${mon ?? ''}`.trim();

  const sorted = [...routineBlocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submitDraft = (blockId: string) => {
    const text = (drafts[blockId] || '').trim();
    if (!text) return;
    onAddSubtask(blockId, text);
    setDrafts((d) => ({ ...d, [blockId]: '' }));
  };

  return (
    <Page className="bg-warm-50 dark:bg-warm-950">
      <ScreenHeader
        onBack={onBack}
        title={title}
        right={
          <button
            type="button"
            aria-label="Calendar"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 border border-warm-200 text-warm-700 shadow-sm dark:bg-warm-900 dark:border-warm-800 dark:text-warm-200"
          >
            <CalendarDays className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-5 flex flex-col gap-3">
        {sorted.length === 0 && (
          <div className="card rounded-[18px] p-6 text-center text-sm text-warm-500 dark:text-warm-400">
            No blocks scheduled for today.
          </div>
        )}

        {sorted.map((block) => {
          const style = CATEGORY_STYLE[block.category] ?? CATEGORY_STYLE.project;
          const Icon = style.icon;
          const subtasks = getBlockSubtasks(block);
          const doneCount = subtasks.filter((_, i) => dailyLog.subtaskDone?.[`${block.id}:${i}`]).length;
          const total = subtasks.length;
          const complete = total > 0 && doneCount === total;
          const status = dailyLog.blockStatus?.[block.id];
          const isOpen = expanded.has(block.id);
          const isCurrent = currentBlock?.id === block.id;

          return (
            <div
              key={block.id}
              className={`card rounded-[18px] overflow-hidden ${
                isCurrent ? 'ring-2 ring-honey-300/80 border-l-4 !border-l-honey-400 dark:ring-amber-600/50' : ''
              } ${status === 'skipped' ? 'opacity-70' : ''}`}
            >
              <button
                type="button"
                onClick={() => toggle(block.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-3.5 py-3 text-left"
              >
                <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${style.tile}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[15px] font-bold text-warm-800 dark:text-warm-50 truncate">{block.name}</span>
                    {status === 'done' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-forest-100 text-forest-700 text-[10px] font-bold dark:bg-forest-900/60 dark:text-forest-300">
                        <Check className="w-3 h-3 stroke-[3]" /> Done
                      </span>
                    )}
                    {status === 'skipped' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-warm-200 text-warm-600 text-[10px] font-bold dark:bg-warm-800 dark:text-warm-300">
                        Skipped
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                    {formatTimeRange(block.startTime, block.endTime)}
                    {isCurrent && <span className="ml-1.5 font-semibold text-focus-600 dark:text-focus-400">· Now</span>}
                  </span>
                </span>
                {total > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold tabular-nums ${
                      complete
                        ? 'bg-forest-100 text-forest-700 dark:bg-forest-900/60 dark:text-forest-300'
                        : doneCount > 0
                          ? 'bg-honey-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-warm-100 text-warm-500 dark:bg-warm-800 dark:text-warm-400'
                    }`}
                  >
                    {doneCount}/{total}
                  </span>
                )}
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-warm-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-warm-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 animate-pop-in">
                  <ul className="border-t border-warm-200 dark:border-warm-800">
                    {subtasks.map((text, i) => {
                      const checked = !!dailyLog.subtaskDone?.[`${block.id}:${i}`];
                      return (
                        <li
                          key={`${block.id}-${i}`}
                          className="flex items-center gap-3 py-2.5 border-b border-warm-200/70 dark:border-warm-800/70 cursor-pointer"
                          onClick={() => onToggleSubtask(block.id, i)}
                        >
                          <Checkbox checked={checked} onChange={() => onToggleSubtask(block.id, i)} label={text} />
                          <span
                            className={`text-[13px] ${
                              checked ? 'line-through text-warm-400 dark:text-warm-500' : 'text-warm-700 dark:text-warm-200'
                            }`}
                          >
                            {text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <form
                    className="flex items-center gap-2 mt-2.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitDraft(block.id);
                    }}
                  >
                    <input
                      type="text"
                      value={drafts[block.id] || ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [block.id]: e.target.value }))}
                      placeholder="+ Add step"
                      className="flex-1 min-w-0 h-9 px-3 rounded-xl bg-warm-50 border border-warm-200 text-[13px] text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-focus-400 dark:bg-warm-950 dark:border-warm-800 dark:text-warm-100"
                    />
                    <button
                      type="submit"
                      aria-label="Add step"
                      disabled={!(drafts[block.id] || '').trim()}
                      className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-focus-100 text-focus-600 disabled:opacity-50 dark:bg-focus-900/40 dark:text-focus-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="flex items-center gap-2 mt-3">
                    {status !== 'done' ? (
                      <button type="button" className="btn-pill" onClick={() => onMarkBlockStatus(block.id, 'done')}>
                        Mark block done
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-xs font-semibold text-warm-500 px-2 py-1"
                        onClick={() => onMarkBlockStatus(block.id, 'pending')}
                      >
                        Undo
                      </button>
                    )}
                    {status !== 'skipped' && status !== 'done' && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-warm-500 dark:text-warm-400 px-2 py-1 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800"
                        onClick={() => onMarkBlockStatus(block.id, 'skipped')}
                      >
                        Skip
                      </button>
                    )}
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-focus-600 dark:text-focus-400 px-2 py-1 rounded-lg hover:bg-focus-50 dark:hover:bg-warm-800"
                      onClick={() => onOpenBreakdown(block)}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Break down
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
};
