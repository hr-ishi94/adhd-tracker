import React, { useState, useEffect } from 'react';
import type { RoutineBlock, DailyLog, BlockStatus, TodoItem, TodoPriority, TodoCategory, TicketColorTheme, DreamAssessment } from '../types';
import { formatTimeRange } from '../lib/time';
import { TicketTodoCard } from '../components/TicketTodoCard';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { ART, CoinIcon, SegmentedTabs } from '../components/ui';
import {
  Check,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Plus,
  CheckCircle2,
  Sparkles,
  Split,
  FastForward,
  Moon,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayScreenProps {
  routineBlocks: RoutineBlock[];
  dailyLog: DailyLog;
  currentBlock: RoutineBlock | null;
  nextBlock: RoutineBlock | null;
  todos: TodoItem[];
  dreamAssessment?: DreamAssessment | null;
  coins?: number;
  userName?: string;
  onUpdatePriority: (newPriority: string) => void;
  onMarkBlockStatus: (blockId: string, status: BlockStatus) => void;
  onOpenBreakdown: (block: RoutineBlock) => void;
  onToggleTodo: (id: string, coinsAwarded?: number) => void;
  onAddTodo: (
    text: string, 
    priority: TodoPriority, 
    coins?: number, 
    category?: TodoCategory, 
    colorTheme?: TicketColorTheme
  ) => boolean;
  onChangeTodoPriority: (id: string, priority: TodoPriority) => void;
  onDeleteTodo: (id: string) => void;
  onNavigateToLearning?: () => void;
  onOpenEveningReview?: () => void;
  onOpenProfile?: () => void;
  onOpenSchedule?: () => void;
}

// Custom hook to animate numeric counter smoothly
function useAnimatedCounter(targetValue: number) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const currentRef = React.useRef(currentValue);
  currentRef.current = currentValue;

  useEffect(() => {
    const startValue = currentRef.current;
    if (startValue === targetValue) return;

    const duration = 500;
    const startTime = performance.now();

    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const ease = 1 - (1 - progress) * (1 - progress);
      const val = Math.round(startValue + (targetValue - startValue) * ease);
      setCurrentValue(val);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, [targetValue]);

  return currentValue;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  routineBlocks,
  dailyLog,
  currentBlock,
  nextBlock,
  todos,
  coins = 25982,
  userName = 'Kendrick',
  onMarkBlockStatus,
  onOpenBreakdown,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onOpenEveningReview,
  onOpenProfile,
  onOpenSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<TodoCategory>('habit');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const animatedCoins = useAnimatedCounter(coins);

  // Filter todos by category
  const filteredTodos = todos.filter((t) => (t.category || 'habit') === activeTab);
  const openCount = filteredTodos.filter((t) => t.status !== 'done').length;

  // Calculate completion ratio
  const completedCount = todos.filter((t) => t.status === 'done').length;
  // If baseline matches initial, display 23 / 54 or dynamic
  const totalDisplayCompleted = 23 + completedCount;
  const totalDisplayTarget = 54;

  const blocksDone = routineBlocks.filter((b) => dailyLog.blockStatus[b.id] === 'done').length;

  const handleToggleHabit = (id: string, coinsAwarded: number) => {
    onToggleTodo(id, coinsAwarded);
  };

  const handleDoneBlock = (blockId: string) => {
    onMarkBlockStatus(blockId, 'done');
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#F0B84A', '#E0621F', '#FFFFFF'],
      disableForReducedMotion: true,
    });
  };

  const currentStatus = currentBlock ? dailyLog.blockStatus[currentBlock.id] || 'pending' : 'pending';
  const scheduleBlock = currentBlock || nextBlock;
  const textShadow = { textShadow: '0 1px 6px rgba(40, 25, 10, 0.45)' };

  return (
    <div className="min-h-full w-full max-w-md mx-auto flex flex-col pb-28 text-warm-800 dark:text-warm-100">
      {/* HERO: sunny hills, cottage and coin jar */}
      <div className="relative w-full h-[235px] overflow-hidden safe-top">
        <img
          src={ART.todayHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 pointer-events-none" />

        {/* Greeting row */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-4">
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile"
            className="flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform"
          >
            <img src={ART.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md bg-honey-100" />
            <div className="text-white" style={textShadow}>
              <p className="text-base font-bold leading-tight">Hi {userName} 👋</p>
              <p className="text-xs font-medium text-white/90">Let's make today count</p>
            </div>
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Settings"
            className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Coin stat + completed box */}
        <div className="absolute z-10 inset-x-0 bottom-7 px-5 flex items-end justify-between gap-3">
          <div className="text-white" style={textShadow}>
            <div className="flex items-center gap-2">
              <CoinIcon className="w-7 h-7 shadow-md" />
              <span className="text-[28px] font-black tracking-tight leading-none tabular-nums">
                {animatedCoins.toLocaleString()}
              </span>
            </div>
            <p className="text-xs font-semibold text-white/90 mt-1">COS coins collected</p>
          </div>

          <div className="shrink-0 rounded-2xl bg-forest-800/80 backdrop-blur-md border border-white/10 px-3 py-1.5 text-white shadow-md">
            <div className="flex items-center gap-1 text-base font-extrabold leading-tight tabular-nums">
              <span>
                {totalDisplayCompleted} / {totalDisplayTarget}
              </span>
              <ChevronDown className="w-4 h-4 text-white/80" />
            </div>
            <p className="text-[10px] font-medium text-white/75">Completed today</p>
          </div>
        </div>
      </div>

      {/* CREAM SHEET */}
      <div className="relative z-20 -mt-4 flex-1 rounded-t-[28px] bg-[#F7F0E3] dark:bg-warm-950 px-5 pt-5 space-y-4">
        <SegmentedTabs
          className="w-full"
          options={[
            { id: 'habit' as TodoCategory, label: 'Daily habits' },
            { id: 'goal' as TodoCategory, label: 'Goals' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-warm-800 dark:text-warm-50">Top Priorities</h2>
          <span className="text-xs font-medium text-warm-500 dark:text-warm-400">{openCount} left</span>
        </div>

        {/* PRIORITY TICKETS */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="card py-8 text-center text-warm-500 dark:text-warm-400 space-y-2">
              <Sparkles className="w-6 h-6 mx-auto text-honey-400" />
              <p className="text-sm font-medium">No {activeTab === 'habit' ? 'habits' : 'goals'} here yet.</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TicketTodoCard key={todo.id} todo={todo} onToggleDone={handleToggleHabit} onDelete={onDeleteTodo} />
            ))
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-warm-300 dark:border-warm-700 hover:border-focus-400 text-focus-600 dark:text-focus-400 font-bold text-sm flex items-center justify-center gap-1.5 transition-all hover:bg-focus-50/60 dark:hover:bg-warm-900 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add {activeTab === 'habit' ? 'Habit' : 'Goal'} Ticket</span>
          </button>
        </div>

        {/* TODAY'S SCHEDULE */}
        <div className="card p-3.5">
          <button
            type="button"
            onClick={onOpenSchedule}
            className="w-full flex items-center gap-3 text-left"
            aria-label="Open today's schedule"
          >
            <span className="w-11 h-11 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-warm-800 dark:text-warm-50">Today's schedule</p>
                {currentBlock && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-focus-500 animate-pulse" />
                    Now
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-500 dark:text-warm-400 truncate">
                {scheduleBlock
                  ? `${currentBlock ? '' : 'Next: '}${scheduleBlock.name} • ${formatTimeRange(scheduleBlock.startTime, scheduleBlock.endTime)}`
                  : `${blocksDone} / ${routineBlocks.length} blocks done`}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-warm-400 shrink-0" />
          </button>

          {currentBlock && (
            <div className="mt-3 pt-3 border-t border-warm-200 dark:border-warm-800 flex items-center justify-between gap-2">
              {currentBlock.firstStep ? (
                <p className="text-xs text-warm-600 dark:text-warm-300 min-w-0 truncate">
                  <strong>First step:</strong> {currentBlock.firstStep}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenBreakdown(currentBlock)}
                  className="inline-flex items-center gap-1 text-xs text-focus-600 dark:text-focus-400 font-semibold min-w-0"
                >
                  <Split className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Break down first 10-min step</span>
                </button>
              )}

              {currentStatus === 'done' ? (
                <span className="flex items-center gap-1 text-xs font-bold text-forest-600 dark:text-forest-300 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </span>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDoneBlock(currentBlock.id)}
                    className="btn-pill inline-flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkBlockStatus(currentBlock.id, 'skipped')}
                    aria-label="Skip block"
                    title="Skip"
                    className="p-1.5 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* EVENING REVIEW ENTRY */}
        {onOpenEveningReview && (
          <button
            type="button"
            onClick={onOpenEveningReview}
            className="card w-full p-3.5 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
          >
            <span className="w-11 h-11 rounded-2xl bg-forest-800 text-honey-300 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-warm-800 dark:text-warm-50">Evening review</p>
              <p className="text-xs text-warm-500 dark:text-warm-400 truncate">Reflect on your day in 2 minutes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-warm-400 shrink-0" />
          </button>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      <CreateTicketModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCategory={activeTab}
        onAdd={onAddTodo}
      />
    </div>
  );
};
