import type { AppData, RoutineBlock, DailyLog, Streak } from '../types';

export const STORAGE_KEY = 'focus-app-data';

export const DEFAULT_ROUTINE_BLOCKS: RoutineBlock[] = [
  {
    id: 'block-morning-learning',
    name: 'Morning Learning Sprint',
    startTime: '05:30',
    endTime: '07:00',
    category: 'learning',
  },
  {
    id: 'block-gym-morning',
    name: 'Gym & Morning Routine',
    startTime: '07:00',
    endTime: '08:30',
    category: 'gym',
  },
  {
    id: 'block-office',
    name: 'Office & Deep Work',
    startTime: '09:30',
    endTime: '18:30',
    category: 'office',
  },
  {
    id: 'block-evening-project',
    name: 'Evening Side Project',
    startTime: '19:30',
    endTime: '21:00',
    category: 'project',
  },
  {
    id: 'block-evening-review',
    name: 'Evening Review & Wind Down',
    startTime: '21:00',
    endTime: '21:30',
    category: 'review',
  },
  {
    id: 'block-sleep',
    name: 'Sleep & Recharge',
    startTime: '22:30',
    endTime: '05:30',
    category: 'sleep',
  },
];

export const DEFAULT_STREAK: Streak = {
  current: 0,
  best: 0,
  lastCompletedDate: null,
  lastPausedDate: null,
};

export const INITIAL_APP_DATA: AppData = {
  version: 1,
  routineBlocks: DEFAULT_ROUTINE_BLOCKS,
  dailyLogs: {},
  brainDump: [],
  streak: DEFAULT_STREAK,
  weeklyRetroNotes: {},
  settings: {
    notificationsEnabled: false,
    soundEnabled: true,
    theme: 'system',
  },
};

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getEmptyDailyLog(dateStr: string): DailyLog {
  return {
    date: dateStr,
    priority: '',
    blockStatus: {},
    reviewWhatGotDone: '',
    reviewWhatSlipped: '',
    reviewWhy: null,
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(INITIAL_APP_DATA);
      return INITIAL_APP_DATA;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    
    // Ensure all keys exist in case of future migrations
    return {
      version: parsed.version || 1,
      routineBlocks: parsed.routineBlocks && parsed.routineBlocks.length > 0 
        ? parsed.routineBlocks 
        : DEFAULT_ROUTINE_BLOCKS,
      dailyLogs: parsed.dailyLogs || {},
      brainDump: parsed.brainDump || [],
      streak: parsed.streak || DEFAULT_STREAK,
      weeklyRetroNotes: parsed.weeklyRetroNotes || {},
      settings: {
        notificationsEnabled: parsed.settings?.notificationsEnabled ?? false,
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        theme: parsed.settings?.theme ?? 'system',
      },
    };
  } catch (err) {
    console.error('Failed to load focus app data from localStorage:', err);
    return INITIAL_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save focus app data to localStorage:', err);
  }
}

/**
 * Updates or creates the DailyLog for today or a specific date.
 */
export function getOrCreateDailyLog(appData: AppData, dateStr: string = getTodayDateString()): DailyLog {
  return appData.dailyLogs[dateStr] || getEmptyDailyLog(dateStr);
}

/**
 * Calculates non-punitive streak:
 * If all active routine blocks for a day are marked Done or Skipped (at least 1 done),
 * streak continues. If a day is missed, streak is PAUSED (never zeroed out).
 */
export function updateStreakAfterBlockCompletion(appData: AppData, dateStr: string): Streak {
  const log = appData.dailyLogs[dateStr];
  if (!log) return appData.streak;

  const totalBlocks = appData.routineBlocks.length;
  if (totalBlocks === 0) return appData.streak;

  let doneCount = 0;
  let skippedCount = 0;
  for (const block of appData.routineBlocks) {
    const status = log.blockStatus[block.id];
    if (status === 'done') doneCount++;
    else if (status === 'skipped') skippedCount++;
  }

  // All blocks resolved for the day and at least one actually done
  const allResolved = (doneCount + skippedCount) === totalBlocks;
  const streak = { ...appData.streak };

  if (allResolved && doneCount > 0) {
    if (streak.lastCompletedDate !== dateStr) {
      // Check if lastCompletedDate was yesterday or earlier
      streak.current = streak.current + 1;
      if (streak.current > streak.best) {
        streak.best = streak.current;
      }
      streak.lastCompletedDate = dateStr;
      streak.lastPausedDate = null;
    }
  }

  return streak;
}

/**
 * Export data as formatted JSON string
 */
export function exportAppDataJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Validate and import external JSON
 */
export function importAppDataJSON(jsonStr: string): { success: boolean; data?: AppData; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }
    if (!Array.isArray(parsed.routineBlocks)) {
      return { success: false, error: 'Missing or invalid routineBlocks array' };
    }
    const cleanData: AppData = {
      version: parsed.version || 1,
      routineBlocks: parsed.routineBlocks,
      dailyLogs: parsed.dailyLogs || {},
      brainDump: Array.isArray(parsed.brainDump) ? parsed.brainDump : [],
      streak: parsed.streak || DEFAULT_STREAK,
      weeklyRetroNotes: parsed.weeklyRetroNotes || {},
      settings: parsed.settings || { notificationsEnabled: false, soundEnabled: true, theme: 'system' },
    };
    saveAppData(cleanData);
    return { success: true, data: cleanData };
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Failed to parse JSON file' };
  }
}
