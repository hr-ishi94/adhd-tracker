import type { 
  AppData, 
  RoutineBlock, 
  DailyLog, 
  Streak, 
  RoutineSet, 
  RoutineSchedule, 
  Sprint, 
  DayOfWeek,
  TodoItem,
  TodoPriority
} from '../types';

export const STORAGE_KEY = 'focus-app-data';

export const DEFAULT_WEEKDAY_BLOCKS: RoutineBlock[] = [
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

export const DEFAULT_SATURDAY_BLOCKS: RoutineBlock[] = [
  {
    id: 'block-sat-workout',
    name: 'Morning Workout & Breakfast',
    startTime: '07:30',
    endTime: '09:30',
    category: 'gym',
  },
  {
    id: 'block-sat-project',
    name: 'Deep Side Project Sprint',
    startTime: '10:30',
    endTime: '13:30',
    category: 'project',
  },
  {
    id: 'block-sat-learning',
    name: 'System Design / Architecture Study',
    startTime: '15:30',
    endTime: '17:30',
    category: 'learning',
  },
  {
    id: 'block-sat-review',
    name: 'Evening Review & Social Time',
    startTime: '21:00',
    endTime: '21:30',
    category: 'review',
  },
  {
    id: 'block-sat-sleep',
    name: 'Sleep & Rest',
    startTime: '23:00',
    endTime: '07:00',
    category: 'sleep',
  },
];

export const DEFAULT_SUNDAY_BLOCKS: RoutineBlock[] = [
  {
    id: 'block-sun-morning',
    name: 'Morning Walk & Rest',
    startTime: '08:00',
    endTime: '09:30',
    category: 'personal',
  },
  {
    id: 'block-sun-learning',
    name: 'Weekly Planning & Learning Sprint',
    startTime: '10:30',
    endTime: '12:30',
    category: 'learning',
  },
  {
    id: 'block-sun-project',
    name: 'Side Project Polish',
    startTime: '16:00',
    endTime: '18:00',
    category: 'project',
  },
  {
    id: 'block-sun-retro',
    name: 'Weekly Retro & Next Week Setup',
    startTime: '20:30',
    endTime: '21:30',
    category: 'review',
  },
  {
    id: 'block-sun-sleep',
    name: 'Sleep & Early Night',
    startTime: '22:30',
    endTime: '05:30',
    category: 'sleep',
  },
];

export const DEFAULT_ROUTINE_SETS: RoutineSet[] = [
  { id: 'set-weekday', name: 'Weekday', blocks: DEFAULT_WEEKDAY_BLOCKS },
  { id: 'set-saturday', name: 'Saturday', blocks: DEFAULT_SATURDAY_BLOCKS },
  { id: 'set-sunday', name: 'Sunday', blocks: DEFAULT_SUNDAY_BLOCKS },
];

export const DEFAULT_ROUTINE_SCHEDULE: RoutineSchedule = {
  0: 'set-sunday',
  1: 'set-weekday',
  2: 'set-weekday',
  3: 'set-weekday',
  4: 'set-weekday',
  5: 'set-weekday',
  6: 'set-saturday',
};

export const DEFAULT_SPRINTS: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Next.js Full Stack Project & System Architecture',
    durationWeeks: 2,
    startDate: new Date().toISOString().slice(0, 10),
    status: 'active',
  },
  {
    id: 'sprint-2',
    name: 'Django REST Framework & Microservices',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
  },
  {
    id: 'sprint-3',
    name: 'DSA Mastery: Trees, Graphs & Dynamic Programming',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
  },
  {
    id: 'sprint-4',
    name: 'High-Scale System Design & Database Sharding',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
  },
  {
    id: 'sprint-5',
    name: 'AI Agent Integrations & Real-Time WebSockets',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
  },
  {
    id: 'sprint-6',
    name: 'Portfolio Polish, CI/CD & Production Hardening',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
  },
  {
    id: 'sprint-7',
    name: 'UAE Technical Interview Prep & Application Blitz',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
  },
];

export const DEFAULT_STREAK: Streak = {
  current: 0,
  best: 0,
  lastCompletedDate: null,
  lastPausedDate: null,
};

export const INITIAL_APP_DATA: AppData = {
  version: 2,
  routineBlocks: DEFAULT_WEEKDAY_BLOCKS,
  routineSets: DEFAULT_ROUTINE_SETS,
  routineSchedule: DEFAULT_ROUTINE_SCHEDULE,
  sprints: DEFAULT_SPRINTS,
  todos: [],
  dailyLogs: {},
  brainDump: [],
  streak: DEFAULT_STREAK,
  weeklyRetroNotes: {},
  settings: {
    notificationsEnabled: false,
    soundEnabled: true,
    theme: 'system',
  },
  lastAutoExportDate: null,
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
    blockDetails: {},
    completedTodos: [],
    reviewWhatGotDone: '',
    reviewWhatSlipped: '',
    reviewWhy: null,
    notes: '',
    spendingPlanMatched: null,
  };
}

/**
 * Resolves the active routine blocks for a given date based on day of week schedule.
 */
export function getRoutineBlocksForDate(appData: AppData, d: Date = new Date()): RoutineBlock[] {
  const dayOfWeek = d.getDay() as DayOfWeek;
  const setId = appData.routineSchedule?.[dayOfWeek] || 'set-weekday';
  const matchedSet = appData.routineSets?.find((s) => s.id === setId);
  if (matchedSet && matchedSet.blocks && matchedSet.blocks.length > 0) {
    return matchedSet.blocks;
  }
  // Fallback to legacy routineBlocks or weekday
  return appData.routineBlocks && appData.routineBlocks.length > 0
    ? appData.routineBlocks
    : DEFAULT_WEEKDAY_BLOCKS;
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(INITIAL_APP_DATA);
      return INITIAL_APP_DATA;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    
    // Migration to v2: Ensure routineSets, routineSchedule, and sprints exist
    let routineSets = parsed.routineSets;
    if (!routineSets || routineSets.length === 0) {
      const existingBlocks = parsed.routineBlocks && parsed.routineBlocks.length > 0
        ? parsed.routineBlocks
        : DEFAULT_WEEKDAY_BLOCKS;
      routineSets = [
        { id: 'set-weekday', name: 'Weekday', blocks: existingBlocks },
        { id: 'set-saturday', name: 'Saturday', blocks: DEFAULT_SATURDAY_BLOCKS },
        { id: 'set-sunday', name: 'Sunday', blocks: DEFAULT_SUNDAY_BLOCKS },
      ];
    }

    const routineSchedule = parsed.routineSchedule || DEFAULT_ROUTINE_SCHEDULE;
    const sprints = parsed.sprints && parsed.sprints.length > 0 ? parsed.sprints : DEFAULT_SPRINTS;
    const todos = Array.isArray(parsed.todos) ? parsed.todos : [];

    const data: AppData = {
      version: 2,
      routineBlocks: parsed.routineBlocks || DEFAULT_WEEKDAY_BLOCKS,
      routineSets,
      routineSchedule,
      sprints,
      todos,
      dailyLogs: parsed.dailyLogs || {},
      brainDump: parsed.brainDump || [],
      streak: parsed.streak || DEFAULT_STREAK,
      weeklyRetroNotes: parsed.weeklyRetroNotes || {},
      settings: {
        notificationsEnabled: parsed.settings?.notificationsEnabled ?? false,
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        theme: parsed.settings?.theme ?? 'system',
      },
      lastAutoExportDate: parsed.lastAutoExportDate || null,
    };

    return data;
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

export function getOrCreateDailyLog(appData: AppData, dateStr: string = getTodayDateString()): DailyLog {
  const existing = appData.dailyLogs[dateStr];
  if (existing) {
    return {
      ...existing,
      blockDetails: existing.blockDetails || {},
      notes: existing.notes ?? '',
      spendingPlanMatched: existing.spendingPlanMatched ?? null,
    };
  }
  return getEmptyDailyLog(dateStr);
}

export function updateStreakAfterBlockCompletion(appData: AppData, dateStr: string, activeBlocks: RoutineBlock[]): Streak {
  const log = appData.dailyLogs[dateStr];
  if (!log) return appData.streak;

  const totalBlocks = activeBlocks.length;
  if (totalBlocks === 0) return appData.streak;

  let doneCount = 0;
  let skippedCount = 0;
  for (const block of activeBlocks) {
    const status = log.blockStatus[block.id];
    if (status === 'done') doneCount++;
    else if (status === 'skipped') skippedCount++;
  }

  const allResolved = (doneCount + skippedCount) === totalBlocks;
  const streak = { ...appData.streak };

  if (allResolved && doneCount > 0) {
    if (streak.lastCompletedDate !== dateStr) {
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

export function exportAppDataJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function downloadBackupFile(data: AppData, prefix: string = 'daily-focus-backup'): void {
  const jsonStr = exportAppDataJSON(data);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = getTodayDateString();
  link.href = url;
  link.download = `${prefix}-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * P0 #1: Automatic weekly backup export
 * Checks on load if 7+ days have passed since last export (or Sunday check).
 * Triggers download automatically and returns true if backup was triggered.
 */
export function checkAndRunAutoWeeklyBackup(appData: AppData, now: Date = new Date()): { triggered: boolean; updatedData: AppData } {
  const todayStr = getTodayDateString(now);
  const isSunday = now.getDay() === 0;

  let shouldExport = false;

  if (!appData.lastAutoExportDate) {
    // If never exported, trigger if today is Sunday or user has at least 3 daily logs
    if (isSunday || Object.keys(appData.dailyLogs).length >= 3) {
      shouldExport = true;
    }
  } else {
    // Check days difference
    const lastDate = new Date(appData.lastAutoExportDate);
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 7 || (isSunday && diffDays >= 6)) {
      shouldExport = true;
    }
  }

  if (shouldExport) {
    try {
      downloadBackupFile(appData, 'daily-focus-auto-backup');
      const updatedData: AppData = {
        ...appData,
        lastAutoExportDate: todayStr,
      };
      saveAppData(updatedData);
      return { triggered: true, updatedData };
    } catch (err) {
      console.warn('Auto backup download error:', err);
    }
  }

  return { triggered: false, updatedData: appData };
}

export function importAppDataJSON(jsonStr: string): { success: boolean; data?: AppData; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }

    const cleanData: AppData = {
      version: parsed.version || 2,
      routineBlocks: Array.isArray(parsed.routineBlocks) ? parsed.routineBlocks : DEFAULT_WEEKDAY_BLOCKS,
      routineSets: Array.isArray(parsed.routineSets) ? parsed.routineSets : DEFAULT_ROUTINE_SETS,
      routineSchedule: parsed.routineSchedule || DEFAULT_ROUTINE_SCHEDULE,
      sprints: Array.isArray(parsed.sprints) ? parsed.sprints : DEFAULT_SPRINTS,
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      dailyLogs: parsed.dailyLogs || {},
      brainDump: Array.isArray(parsed.brainDump) ? parsed.brainDump : [],
      streak: parsed.streak || DEFAULT_STREAK,
      weeklyRetroNotes: parsed.weeklyRetroNotes || {},
      settings: parsed.settings || { notificationsEnabled: false, soundEnabled: true, theme: 'system' },
      lastAutoExportDate: parsed.lastAutoExportDate || null,
    };

    saveAppData(cleanData);
    return { success: true, data: cleanData };
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Failed to parse JSON file' };
  }
}

/**
 * Returns all active (open) todos.
 */
export function getActiveTodos(todos: TodoItem[] = []): TodoItem[] {
  return todos.filter((t) => t.status === 'open');
}

/**
 * Returns open todos for a specific priority tier (A, B, or C).
 */
export function getTodosByPriority(todos: TodoItem[] = [], priority: TodoPriority): TodoItem[] {
  return todos.filter((t) => t.status === 'open' && t.priority === priority);
}

/**
 * Checks whether an item can be added to the given priority tier.
 * Capped at 3 open items per letter (A/B/C).
 */
export function canAddTodo(todos: TodoItem[] = [], priority: TodoPriority): boolean {
  const count = getTodosByPriority(todos, priority).length;
  return count < 3;
}

/**
 * Returns todos completed on a specific date.
 */
export function getCompletedTodosForDate(todos: TodoItem[] = [], dateStr: string): TodoItem[] {
  return todos.filter((t) => t.status === 'done' && t.completedDate === dateStr);
}

/**
 * Returns open todos that were created more than 7 days ago
 * and have not yet been flagged during the given retro week.
 */
export function getSittingTodosOver7Days(
  todos: TodoItem[] = [],
  currentWeekKey: string,
  now: Date = new Date()
): TodoItem[] {
  const sevenDaysAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return todos.filter((t) => {
    if (t.status !== 'open') return false;
    // Don't repeat if already nudged/reviewed for this week
    if (t.lastNudgeWeekKey === currentWeekKey) return false;
    const createdMs = new Date(t.createdDate).getTime();
    return createdMs <= sevenDaysAgoMs;
  });
}

