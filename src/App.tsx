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
  TodoCategory,
  TicketColorTheme,
  HabitQuitTracker,
  DreamAssessment,
  BrainDumpTag,
  Reward
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
  DEFAULT_HABIT_TRACKERS,
  getBlockSubtasks
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
import { ProfileScreen } from './screens/ProfileScreen';
import { DayScheduleScreen } from './screens/DayScheduleScreen';
import { TaskCompletedModal } from './components/TaskCompletedModal';
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
  const [celebration, setCelebration] = useState<{ name: string; coins: number } | null>(null);

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

  // Priority Tickets / To-Dos Handlers
  const handleAddTodo = (
    text: string, 
    priority: TodoPriority,
    coins?: number,
    category?: TodoCategory,
    colorTheme?: TicketColorTheme
  ): boolean => {
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: text.trim(),
      priority,
      status: 'open',
      createdDate: todayStr,
      coins: coins ?? (priority === 'A' ? 30 : priority === 'B' ? 40 : 50),
      category: category ?? 'habit',
      colorTheme: colorTheme ?? (priority === 'A' ? 'amber' : priority === 'B' ? 'yellow' : 'green'),
    };
    setAppData((prev) => ({
      ...prev,
      todos: [newTodo, ...prev.todos],
    }));
    return true;
  };

  const handleToggleTodo = (id: string, coinsDelta?: number) => {
    const targetTodo = appData.todos.find((t) => t.id === id);
    if (!targetTodo) return;

    const willBeDone = targetTodo.status !== 'done';
    const amount = coinsDelta !== undefined ? coinsDelta : (targetTodo.coins || 30);

    if (willBeDone) {
      setCelebration({ name: targetTodo.text, coins: Math.abs(amount) });
      setUndoState({
        blockId: id,
        blockName: targetTodo.text,
        action: 'done',
        previousStreak: { ...appData.streak },
        isTodo: true,
      });
    }

    setAppData((prev) => {
      const currentCoins = prev.coins ?? 25982;
      const newCoins = willBeDone 
        ? currentCoins + Math.abs(amount)
        : Math.max(0, currentCoins - Math.abs(amount));

      return {
        ...prev,
        coins: newCoins,
        todos: prev.todos.map((t) =>
          t.id === id
            ? {
                ...t,
                status: willBeDone ? 'done' : 'open',
                completedDate: willBeDone ? todayStr : null,
              }
            : t
        ),
      };
    });
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
      setAppData((prev) => {
        const targetTodo = prev.todos.find((t) => t.id === undoState.blockId);
        const reward = targetTodo?.coins || 30;
        return {
          ...prev,
          coins: Math.max(0, (prev.coins ?? 25982) - reward),
          todos: prev.todos.map((t) =>
            t.id === undoState.blockId ? { ...t, status: 'open', completedDate: null } : t
          ),
        };
      });
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

  // Day schedule checklist
  const handleToggleSubtask = (blockId: string, index: number) => {
    setAppData((prev) => {
      const currentLog = getOrCreateDailyLog(prev, todayStr);
      const key = `${blockId}:${index}`;
      const subtaskDone = { ...(currentLog.subtaskDone || {}) };
      subtaskDone[key] = !subtaskDone[key];
      return {
        ...prev,
        dailyLogs: { ...prev.dailyLogs, [todayStr]: { ...currentLog, subtaskDone } },
      };
    });
  };

  const handleAddSubtask = (blockId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const addTo = (b: RoutineBlock): RoutineBlock =>
      b.id === blockId ? { ...b, subtasks: [...getBlockSubtasks(b), trimmed] } : b;
    setAppData((prev) => ({
      ...prev,
      routineBlocks: prev.routineBlocks.map(addTo),
      routineSets: prev.routineSets.map((set) => ({ ...set, blocks: set.blocks.map(addTo) })),
    }));
  };

  // Rewards Store
  const handleRedeemReward = (reward: Reward): boolean => {
    const balance = appData.coins ?? 25982;
    if (balance < reward.cost) return false;
    setAppData((prev) => ({
      ...prev,
      coins: Math.max(0, (prev.coins ?? 25982) - reward.cost),
      redemptions: [
        { id: `redeem-${Date.now()}`, rewardId: reward.id, cost: reward.cost, redeemedAt: new Date().toISOString() },
        ...(prev.redemptions || []),
      ],
    }));
    return true;
  };

  // Brain Dump Actions
  const handleSaveBrainDump = (text: string, tag?: BrainDumpTag) => {
    const newItem: BrainDumpItem = {
      id: `dump-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      convertedToTask: false,
      tag,
    };
    setAppData((prev) => ({
      ...prev,
      brainDump: [newItem, ...prev.brainDump],
    }));
  };

  const handleTagBrainDump = (id: string, tag: BrainDumpTag) => {
    setAppData((prev) => ({
      ...prev,
      brainDump: prev.brainDump.map((i) => (i.id === id ? { ...i, tag } : i)),
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
    <div className="min-h-full flex flex-col bg-[#F7F0E3] dark:bg-warm-950 text-warm-800 dark:text-warm-100 transition-colors relative selection:bg-focus-200 selection:text-warm-900">
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
            coins={appData.coins ?? 25982}
            userName={appData.userName ?? 'Kendrick'}
            dreamAssessment={appData.dreamAssessment}
            onUpdatePriority={handleUpdatePriority}
            onMarkBlockStatus={handleMarkBlockStatus}
            onOpenBreakdown={(block) => setBreakdownBlock(block)}
            onToggleTodo={handleToggleTodo}
            onAddTodo={handleAddTodo}
            onChangeTodoPriority={handleChangeTodoPriority}
            onDeleteTodo={handleDeleteTodo}
            onNavigateToLearning={() => setCurrentTab('learning')}
            onOpenEveningReview={() => setCurrentTab('review')}
            onOpenProfile={() => setCurrentTab('profile')}
            onOpenSchedule={() => setCurrentTab('schedule')}
          />
        )}

        {currentTab === 'schedule' && (
          <DayScheduleScreen
            routineBlocks={todayBlocks}
            dailyLog={dailyLog}
            currentBlock={currentBlock}
            currentTime={currentTime}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onMarkBlockStatus={handleMarkBlockStatus}
            onOpenBreakdown={(block) => setBreakdownBlock(block)}
            onBack={() => setCurrentTab('today')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            userName={appData.userName ?? 'Kendrick'}
            coins={appData.coins ?? 25982}
            streak={appData.streak}
            habitTrackers={appData.habitTrackers || DEFAULT_HABIT_TRACKERS}
            redemptions={appData.redemptions || []}
            onRedeem={handleRedeemReward}
            onOpenSettings={() => setCurrentTab('settings')}
            onBack={() => setCurrentTab('today')}
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
            onOpenProfile={() => setCurrentTab('profile')}
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
            onSaveItem={handleSaveBrainDump}
            onSetTag={handleTagBrainDump}
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
            pomodoroStats={appData.pomodoroStats}
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

      <TaskCompletedModal
        isOpen={Boolean(celebration)}
        taskName={celebration?.name ?? ''}
        coins={celebration?.coins ?? 0}
        onClose={() => setCelebration(null)}
      />

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
