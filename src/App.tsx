import { useState, useEffect, useCallback } from 'react';
import type { 
  AppData, 
  ScreenTab, 
  RoutineBlock, 
  BlockStatus, 
  DailyLog, 
  BrainDumpItem, 
  Streak,
  TodoItem,
  TodoPriority,
  HabitQuitTracker,
  DreamAssessment
} from './types';
import { 
  loadAppData, 
  saveAppData, 
  getTodayDateString, 
  getOrCreateDailyLog, 
  updateStreakAfterBlockCompletion, 
  INITIAL_APP_DATA,
  getRoutineBlocksForDate,
  checkAndRunAutoWeeklyBackup,
  canAddTodo,
  DEFAULT_HABIT_TRACKERS
} from './lib/storage';
import { autoResolveMissedBlocks } from './lib/autoResolve';
import { getCurrentAndNextBlock, getWeekKey } from './lib/time';
import { notifications } from './lib/notifications';
import { Navigation } from './components/Navigation';
import { BrainDumpFAB } from './components/BrainDumpFAB';
import { BrainDumpModal } from './components/BrainDumpModal';
import { BreakdownModal } from './components/BreakdownModal';
import { BannerNotification } from './components/BannerNotification';
import { ToastUndo } from './components/ToastUndo';
import { TodayScreen } from './screens/TodayScreen';
import { InboxScreen } from './screens/InboxScreen';
import { EveningReviewScreen } from './screens/EveningReviewScreen';
import { WeeklyRetroScreen } from './screens/WeeklyRetroScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { RoadmapScreen } from './screens/RoadmapScreen';
import { PomodoroScreen } from './screens/PomodoroScreen';
import { HabitBreakerScreen } from './screens/HabitBreakerScreen';
import { MoreHubScreen } from './screens/MoreHubScreen';
import { Download, X } from 'lucide-react';

interface UndoState {
  blockId: string;
  blockName: string;
  action: BlockStatus;
  previousStreak: Streak;
  isTodo?: boolean;
}

export function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [currentTab, setCurrentTab] = useState<ScreenTab>('today');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [brainDumpOpen, setBrainDumpOpen] = useState(false);
  const [breakdownBlock, setBreakdownBlock] = useState<RoutineBlock | null>(null);
  const [bannerBlock, setBannerBlock] = useState<RoutineBlock | null>(null);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [autoBackupNotice, setAutoBackupNotice] = useState(false);

  const handleUpdateHabitTrackers = (updated: HabitQuitTracker[]) => {
    setAppData((prev) => ({
      ...prev,
      habitTrackers: updated,
      habitTracker: updated[0] || prev.habitTracker,
    }));
  };

  const handleUpdateDreamAssessment = (assessment: DreamAssessment | null) => {
    setAppData((prev) => ({
      ...prev,
      dreamAssessment: assessment,
    }));
  };

  const handlePomodoroSessionCompleted = () => {
    setAppData((prev) => {
      const today = getTodayDateString();
      const prevStats = prev.pomodoroStats || { todayCompleted: 0, lastDate: today, totalCompleted: 0 };
      const isSameDay = prevStats.lastDate === today;
      return {
        ...prev,
        pomodoroStats: {
          todayCompleted: isSameDay ? prevStats.todayCompleted + 1 : 1,
          lastDate: today,
          totalCompleted: prevStats.totalCompleted + 1,
        },
      };
    });
  };

  // Sync state to localStorage whenever appData updates
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Apply theme class (system, light, dark)
  useEffect(() => {
    const root = document.documentElement;
    const theme = appData.settings.theme;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [appData.settings.theme]);

  // P0 #1: Check and run automatic weekly backup export on app mount
  useEffect(() => {
    const { triggered, updatedData } = checkAndRunAutoWeeklyBackup(appData, new Date());
    if (triggered) {
      setAppData(updatedData);
      setAutoBackupNotice(true);
      const timer = setTimeout(() => setAutoBackupNotice(false), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Keep current time updated every 15 seconds to detect block transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Resolve today's routine blocks based on current day of week
  const todayBlocks = getRoutineBlocksForDate(appData, currentTime);

  // P0 #2: Auto-resolve missed blocks whose grace period (+30m) has passed
  useEffect(() => {
    setAppData((prev) => {
      const blocksForNow = getRoutineBlocksForDate(prev, currentTime);
      const res = autoResolveMissedBlocks(prev, blocksForNow, currentTime);
      return res.changed ? res.data : prev;
    });
  }, [currentTime]);

  // Compute current and next block
  const { currentBlock, nextBlock } = getCurrentAndNextBlock(todayBlocks, currentTime);

  // Today's log
  const todayStr = getTodayDateString(currentTime);
  const dailyLog = getOrCreateDailyLog(appData, todayStr);

  // Notification scheduling for block start times
  const handleBlockTrigger = useCallback((block: RoutineBlock) => {
    if (appData.settings.notificationsEnabled) {
      notifications.notifyBlockStart(block);
    }
    // Also show in-app banner with snooze
    setBannerBlock(block);
  }, [appData.settings.notificationsEnabled]);

  useEffect(() => {
    if (appData.settings.notificationsEnabled) {
      notifications.scheduleRoutineChecks(todayBlocks, handleBlockTrigger);
    } else {
      notifications.clearScheduled();
    }
    return () => notifications.clearScheduled();
  }, [todayBlocks, appData.settings.notificationsEnabled, handleBlockTrigger]);

  // Snooze handler
  const handleSnooze = (minutes: number) => {
    const targetBlock = bannerBlock;
    setBannerBlock(null);
    setTimeout(() => {
      if (targetBlock) {
        handleBlockTrigger(targetBlock);
      }
    }, minutes * 60 * 1000);
  };

  // State update helpers
  const handleUpdatePriority = (newPriority: string) => {
    setAppData((prev) => {
      const currentLog = getOrCreateDailyLog(prev, todayStr);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [todayStr]: {
            ...currentLog,
            priority: newPriority,
          },
        },
      };
    });
  };

  // P1 #6: Marking block status + Undo toast support
  const handleMarkBlockStatus = (blockId: string, status: BlockStatus) => {
    if (status === 'done' || status === 'skipped') {
      const targetBlock = todayBlocks.find((b) => b.id === blockId);
      setUndoState({
        blockId,
        blockName: targetBlock?.name || 'Routine Block',
        action: status,
        previousStreak: { ...appData.streak },
        isTodo: false,
      });
    }

    setAppData((prev) => {
      const currentLog = getOrCreateDailyLog(prev, todayStr);
      const updatedLog: DailyLog = {
        ...currentLog,
        blockStatus: {
          ...currentLog.blockStatus,
          [blockId]: status,
        },
        blockDetails: {
          ...(currentLog.blockDetails || {}),
          [blockId]: {
            status,
            autoResolved: false,
          },
        },
      };

      const updatedLogs = {
        ...prev.dailyLogs,
        [todayStr]: updatedLog,
      };

      const intermediateData: AppData = {
        ...prev,
        dailyLogs: updatedLogs,
      };

      const newStreak = updateStreakAfterBlockCompletion(intermediateData, todayStr, todayBlocks);

      return {
        ...intermediateData,
        streak: newStreak,
      };
    });
  };

  // Additional To-Dos Handlers (ABC Psychologist System, capped at 3 per tier)
  const handleAddTodo = (text: string, priority: TodoPriority): boolean => {
    if (!canAddTodo(appData.todos, priority)) {
      return false;
    }
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: text.trim(),
      priority,
      status: 'open',
      createdDate: todayStr,
    };
    setAppData((prev) => ({
      ...prev,
      todos: [newTodo, ...prev.todos],
    }));
    return true;
  };

  const handleToggleTodo = (id: string) => {
    const targetTodo = appData.todos.find((t) => t.id === id);
    if (!targetTodo) return;

    const willBeDone = targetTodo.status !== 'done';

    if (willBeDone) {
      setUndoState({
        blockId: id,
        blockName: targetTodo.text,
        action: 'done',
        previousStreak: { ...appData.streak },
        isTodo: true,
      });
    }

    setAppData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              status: willBeDone ? 'done' : 'open',
              completedDate: willBeDone ? todayStr : null,
            }
          : t
      ),
    }));
  };

  const handleChangeTodoPriority = (id: string, newPriority: TodoPriority) => {
    if (!canAddTodo(appData.todos, newPriority)) {
      return;
    }
    setAppData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, priority: newPriority } : t)),
    }));
  };

  const handleDeleteTodo = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id),
    }));
  };

  const handleAcknowledgeSittingTodo = (
    id: string,
    action: 'keep' | 'demote' | 'done' | 'delete'
  ) => {
    const currentWeekKey = getWeekKey(currentTime);
    if (action === 'delete') {
      handleDeleteTodo(id);
      return;
    }

    setAppData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => {
        if (t.id !== id) return t;
        if (action === 'keep') {
          return { ...t, lastNudgeWeekKey: currentWeekKey };
        }
        if (action === 'demote') {
          return { ...t, priority: 'C', lastNudgeWeekKey: currentWeekKey };
        }
        if (action === 'done') {
          return { ...t, status: 'done', completedDate: todayStr, lastNudgeWeekKey: currentWeekKey };
        }
        return t;
      }),
    }));
  };

  // Undo completion of block or to-do
  const handleUndo = () => {
    if (!undoState) return;

    if (undoState.isTodo) {
      setAppData((prev) => ({
        ...prev,
        todos: prev.todos.map((t) =>
          t.id === undoState.blockId ? { ...t, status: 'open', completedDate: null } : t
        ),
      }));
      setUndoState(null);
      return;
    }

    const { blockId, previousStreak } = undoState;

    setAppData((prev) => {
      const currentLog = getOrCreateDailyLog(prev, todayStr);
      const updatedStatus = { ...currentLog.blockStatus };
      delete updatedStatus[blockId];

      const updatedDetails = { ...(currentLog.blockDetails || {}) };
      delete updatedDetails[blockId];

      const updatedLog: DailyLog = {
        ...currentLog,
        blockStatus: updatedStatus,
        blockDetails: updatedDetails,
      };

      return {
        ...prev,
        streak: previousStreak,
        dailyLogs: {
          ...prev.dailyLogs,
          [todayStr]: updatedLog,
        },
      };
    });

    setUndoState(null);
  };

  const handleSaveFirstStep = (blockId: string, firstStep: string) => {
    setAppData((prev) => ({
      ...prev,
      routineBlocks: prev.routineBlocks.map((b) =>
        b.id === blockId ? { ...b, firstStep } : b
      ),
      routineSets: prev.routineSets.map((s) => ({
        ...s,
        blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, firstStep } : b)),
      })),
    }));
  };

  // Brain Dump Actions
  const handleSaveBrainDump = (text: string) => {
    const newItem: BrainDumpItem = {
      id: `dump-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      convertedToTask: false,
    };
    setAppData((prev) => ({
      ...prev,
      brainDump: [newItem, ...prev.brainDump],
    }));
  };

  const handleDeleteBrainDump = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      brainDump: prev.brainDump.filter((i) => i.id !== id),
    }));
  };

  const handleConvertDumpToTask = (item: BrainDumpItem) => {
    // Set as Today's One Thing
    handleUpdatePriority(item.text);
    setAppData((prev) => ({
      ...prev,
      brainDump: prev.brainDump.map((i) =>
        i.id === item.id ? { ...i, convertedToTask: true } : i
      ),
    }));
    setCurrentTab('today');
  };

  const handleConvertToTodo = (item: BrainDumpItem, priority: TodoPriority): boolean => {
    const added = handleAddTodo(item.text, priority);
    if (added) {
      setAppData((prev) => ({
        ...prev,
        brainDump: prev.brainDump.map((i) =>
          i.id === item.id ? { ...i, convertedToTask: true } : i
        ),
      }));
      setCurrentTab('today');
      return true;
    }
    return false;
  };

  const handleClearAllDoneDumps = () => {
    setAppData((prev) => ({
      ...prev,
      brainDump: prev.brainDump.filter((i) => !i.convertedToTask),
    }));
  };

  // Review Actions
  const handleSaveReview = (reviewFields: Partial<DailyLog>) => {
    setAppData((prev) => {
      const currentLog = getOrCreateDailyLog(prev, todayStr);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [todayStr]: {
            ...currentLog,
            ...reviewFields,
          },
        },
      };
    });
  };

  // Retro Actions
  const handleSaveRetroNote = (weekKey: string, note: string) => {
    setAppData((prev) => ({
      ...prev,
      weeklyRetroNotes: {
        ...prev.weeklyRetroNotes,
        [weekKey]: note,
      },
    }));
  };

  const handleResetAllData = () => {
    setAppData(INITIAL_APP_DATA);
  };

  const unreadDumpsCount = appData.brainDump.filter((i) => !i.convertedToTask).length;

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-[#fff5f0] via-[#fbf8f6] to-[#f3eee8] dark:from-[#180804] dark:via-[#130b08] dark:to-[#0c0908] text-warm-900 dark:text-warm-100 transition-colors relative selection:bg-focus-500 selection:text-white">
      {/* Radiant ambient glow blobs inspired by reference design */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-28 -left-16 w-[450px] h-[450px] rounded-full bg-focus-500/15 dark:bg-focus-600/25 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full bg-amber-400/15 dark:bg-amber-500/15 blur-3xl" />
        <div className="absolute bottom-24 left-1/4 w-[380px] h-[380px] rounded-full bg-focus-400/10 dark:bg-focus-700/20 blur-3xl" />
      </div>

      {/* Auto Backup Notification Banner */}
      {autoBackupNotice && (
        <div className="fixed top-3 left-3 right-3 z-50 max-w-sm mx-auto bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900 px-3.5 py-2.5 rounded-xl shadow-lifted border border-focus-500/50 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-focus-400 dark:text-focus-600 shrink-0" />
            <span><strong>Weekly backup saved!</strong> A copy of your tracker data was downloaded.</span>
          </div>
          <button
            onClick={() => setAutoBackupNotice(false)}
            className="p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded ml-2 shrink-0"
            aria-label="Dismiss backup notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* In-app reminder banner if a block fires or during test */}
      <BannerNotification
        block={bannerBlock}
        onDismiss={() => setBannerBlock(null)}
        onSnooze={handleSnooze}
        onGoToToday={() => setCurrentTab('today')}
      />

      {/* Screen Routing */}
      <main className="flex-1 flex flex-col w-full">
        {currentTab === 'today' && (
          <TodayScreen
            routineBlocks={todayBlocks}
            dailyLog={dailyLog}
            currentBlock={currentBlock}
            nextBlock={nextBlock}
            todos={appData.todos}
            dreamAssessment={appData.dreamAssessment}
            onUpdatePriority={handleUpdatePriority}
            onMarkBlockStatus={handleMarkBlockStatus}
            onOpenBreakdown={(block) => setBreakdownBlock(block)}
            onToggleTodo={handleToggleTodo}
            onAddTodo={handleAddTodo}
            onChangeTodoPriority={handleChangeTodoPriority}
            onDeleteTodo={handleDeleteTodo}
            onNavigateToLearning={() => setCurrentTab('learning')}
          />
        )}

        {currentTab === 'pomodoro' && (
          <PomodoroScreen
            pomodoroStats={appData.pomodoroStats}
            onSessionCompleted={handlePomodoroSessionCompleted}
          />
        )}

        {(currentTab === 'learning' || currentTab === 'roadmap') && (
          <RoadmapScreen
            dreamAssessment={appData.dreamAssessment}
            onUpdateDreamAssessment={handleUpdateDreamAssessment}
            onStartPomodoro={() => setCurrentTab('pomodoro')}
          />
        )}

        {currentTab === 'habits' && (
          <HabitBreakerScreen
            trackers={appData.habitTrackers && appData.habitTrackers.length > 0
              ? appData.habitTrackers 
              : (appData.habitTracker ? [appData.habitTracker] : DEFAULT_HABIT_TRACKERS)}
            onUpdateTrackers={handleUpdateHabitTrackers}
          />
        )}

        {currentTab === 'more' && (
          <MoreHubScreen
            onNavigate={setCurrentTab}
            inboxCount={unreadDumpsCount}
          />
        )}

        {currentTab === 'inbox' && (
          <InboxScreen
            items={appData.brainDump}
            todos={appData.todos}
            onDeleteItem={handleDeleteBrainDump}
            onConvertToTodo={handleConvertToTodo}
            onSetAsPrimaryFocus={handleConvertDumpToTask}
            onClearAllDone={handleClearAllDoneDumps}
          />
        )}

        {currentTab === 'review' && (
          <EveningReviewScreen
            appData={appData}
            dailyLog={dailyLog}
            onSaveReview={handleSaveReview}
          />
        )}

        {currentTab === 'retro' && (
          <WeeklyRetroScreen
            routineBlocks={todayBlocks}
            dailyLogs={appData.dailyLogs}
            streak={appData.streak}
            weeklyRetroNotes={appData.weeklyRetroNotes}
            todos={appData.todos}
            onSaveRetroNote={handleSaveRetroNote}
            onAcknowledgeSittingTodo={handleAcknowledgeSittingTodo}
            onOpenRoadmap={() => setCurrentTab('learning')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            appData={appData}
            onUpdateAppData={(patch) => setAppData((prev) => ({ ...prev, ...patch }))}
            onOpenRoadmap={() => setCurrentTab('learning')}
            onResetAllData={handleResetAllData}
            onTriggerTestNotification={(block) => handleBlockTrigger(block)}
          />
        )}
      </main>

      {/* Undo Toast on Done/Skip */}
      {undoState && (
        <ToastUndo
          blockName={undoState.blockName}
          action={undoState.action}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      )}

      {/* Floating Action Button for instant Brain Dump on every screen */}
      <BrainDumpFAB onClick={() => setBrainDumpOpen(true)} />

      {/* Brain Dump Modal */}
      <BrainDumpModal
        isOpen={brainDumpOpen}
        onClose={() => setBrainDumpOpen(false)}
        onSave={handleSaveBrainDump}
      />

      {/* Task Breakdown Modal */}
      <BreakdownModal
        isOpen={Boolean(breakdownBlock)}
        block={breakdownBlock}
        onClose={() => setBreakdownBlock(null)}
        onSaveFirstStep={handleSaveFirstStep}
      />

      {/* Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        inboxCount={unreadDumpsCount}
      />
    </div>
  );
}

export default App;
