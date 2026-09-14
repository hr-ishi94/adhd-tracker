import { useState, useEffect, useCallback } from 'react';
import type { 
  AppData, 
  ScreenTab, 
  RoutineBlock, 
  BlockStatus, 
  DailyLog, 
  BrainDumpItem, 
  AppSettings 
} from './types';
import { 
  loadAppData, 
  saveAppData, 
  getTodayDateString, 
  getOrCreateDailyLog, 
  updateStreakAfterBlockCompletion, 
  INITIAL_APP_DATA 
} from './lib/storage';
import { getCurrentAndNextBlock } from './lib/time';
import { notifications } from './lib/notifications';
import { Navigation } from './components/Navigation';
import { BrainDumpFAB } from './components/BrainDumpFAB';
import { BrainDumpModal } from './components/BrainDumpModal';
import { BreakdownModal } from './components/BreakdownModal';
import { BannerNotification } from './components/BannerNotification';
import { TodayScreen } from './screens/TodayScreen';
import { InboxScreen } from './screens/InboxScreen';
import { EveningReviewScreen } from './screens/EveningReviewScreen';
import { WeeklyRetroScreen } from './screens/WeeklyRetroScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [currentTab, setCurrentTab] = useState<ScreenTab>('today');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [brainDumpOpen, setBrainDumpOpen] = useState(false);
  const [breakdownBlock, setBreakdownBlock] = useState<RoutineBlock | null>(null);
  const [bannerBlock, setBannerBlock] = useState<RoutineBlock | null>(null);

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

  // Keep current time updated every 15 seconds to detect block transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute current and next block
  const { currentBlock, nextBlock } = getCurrentAndNextBlock(appData.routineBlocks, currentTime);

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
      notifications.scheduleRoutineChecks(appData.routineBlocks, handleBlockTrigger);
    } else {
      notifications.clearScheduled();
    }
    return () => notifications.clearScheduled();
  }, [appData.routineBlocks, appData.settings.notificationsEnabled, handleBlockTrigger]);

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

  const handleMarkBlockStatus = (blockId: string, status: BlockStatus) => {
    setAppData((prev) => {
      const currentLog = getOrCreateDailyLog(prev, todayStr);
      const updatedLog: DailyLog = {
        ...currentLog,
        blockStatus: {
          ...currentLog.blockStatus,
          [blockId]: status,
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

      const newStreak = updateStreakAfterBlockCompletion(intermediateData, todayStr);

      return {
        ...intermediateData,
        streak: newStreak,
      };
    });
  };

  const handleSaveFirstStep = (blockId: string, firstStep: string) => {
    setAppData((prev) => ({
      ...prev,
      routineBlocks: prev.routineBlocks.map((b) =>
        b.id === blockId ? { ...b, firstStep } : b
      ),
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

  // Settings Actions
  const handleUpdateRoutineBlocks = (blocks: RoutineBlock[]) => {
    setAppData((prev) => ({
      ...prev,
      routineBlocks: blocks,
    }));
  };

  const handleUpdateSettings = (settingsPatch: Partial<AppSettings>) => {
    setAppData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settingsPatch,
      },
    }));
  };

  const handleImportData = (imported: AppData) => {
    setAppData(imported);
  };

  const handleResetAllData = () => {
    setAppData(INITIAL_APP_DATA);
  };

  const unreadDumpsCount = appData.brainDump.filter((i) => !i.convertedToTask).length;

  return (
    <div className="min-h-full flex flex-col bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 transition-colors">
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
            routineBlocks={appData.routineBlocks}
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
            routineBlocks={appData.routineBlocks}
            dailyLogs={appData.dailyLogs}
            streak={appData.streak}
            weeklyRetroNotes={appData.weeklyRetroNotes}
            onSaveRetroNote={handleSaveRetroNote}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            appData={appData}
            onUpdateRoutineBlocks={handleUpdateRoutineBlocks}
            onUpdateSettings={handleUpdateSettings}
            onImportData={handleImportData}
            onResetAllData={handleResetAllData}
            onTriggerTestNotification={(block) => handleBlockTrigger(block)}
          />
        )}
      </main>

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
