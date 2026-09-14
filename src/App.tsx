import { useState, useEffect, useCallback } from 'react';
import type { 
  AppData, 
  ScreenTab, 
  RoutineBlock, 
  BlockStatus, 
  DailyLog, 
  BrainDumpItem, 
  Streak 
} from './types';
import { 
  loadAppData, 
  saveAppData, 
  getTodayDateString, 
  getOrCreateDailyLog, 
  updateStreakAfterBlockCompletion, 
  INITIAL_APP_DATA,
  getRoutineBlocksForDate,
  checkAndRunAutoWeeklyBackup
} from './lib/storage';
import { autoResolveMissedBlocks } from './lib/autoResolve';
import { getCurrentAndNextBlock } from './lib/time';
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
import { Download, X } from 'lucide-react';

interface UndoState {
  blockId: string;
  blockName: string;
  action: BlockStatus;
  previousStreak: Streak;
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

  // Undo block completion or skip
  const handleUndo = () => {
    if (!undoState) return;
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
    // 1. Set as Today's One Thing
    handleUpdatePriority(item.text);
    // 2. Mark converted
    setAppData((prev) => ({
      ...prev,
      brainDump: prev.brainDump.map((i) =>
        i.id === item.id ? { ...i, convertedToTask: true } : i
      ),
    }));
    // 3. Take user to Today screen to see their new focus
    setCurrentTab('today');
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
    <div className="min-h-full flex flex-col bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 transition-colors">
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
            onUpdatePriority={handleUpdatePriority}
            onMarkBlockStatus={handleMarkBlockStatus}
            onOpenBreakdown={(block) => setBreakdownBlock(block)}
          />
        )}

        {currentTab === 'inbox' && (
          <InboxScreen
            items={appData.brainDump}
            onDeleteItem={handleDeleteBrainDump}
            onConvertToTask={handleConvertDumpToTask}
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
            onSaveRetroNote={handleSaveRetroNote}
            onOpenRoadmap={() => setCurrentTab('roadmap')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            appData={appData}
            onUpdateAppData={(patch) => setAppData((prev) => ({ ...prev, ...patch }))}
            onOpenRoadmap={() => setCurrentTab('roadmap')}
            onResetAllData={handleResetAllData}
            onTriggerTestNotification={(block) => handleBlockTrigger(block)}
          />
        )}

        {currentTab === 'roadmap' && (
          <RoadmapScreen
            sprints={appData.sprints}
            onUpdateSprints={(sprints) => setAppData((prev) => ({ ...prev, sprints }))}
            onBack={() => setCurrentTab('settings')}
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
