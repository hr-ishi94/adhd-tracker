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
  TodoPriority,
  HabitMilestone,
  HabitQuitTracker,
  Category,
  Reward
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
    description: 'Build production-ready web application with App Router, Server Actions, and Auth',
    category: 'Frontend & Fullstack',
    durationWeeks: 2,
    startDate: new Date().toISOString().slice(0, 10),
    status: 'active',
    topics: [
      { id: 't-1-1', title: 'App Router vs Pages Router deep dive', completed: true },
      { id: 't-1-2', title: 'Server Components & Streaming SSR', completed: true },
      { id: 't-1-3', title: 'Server Actions & Form Validation with Zod', completed: false },
      { id: 't-1-4', title: 'Database connection & Prisma/Drizzle ORM', completed: false },
      { id: 't-1-5', title: 'Production deployment to Vercel', completed: false },
    ],
  },
  {
    id: 'sprint-2',
    name: 'Django REST Framework & Microservices',
    description: 'Python backend engineering, RESTful APIs, Token Authentication, and PostgreSQL',
    category: 'Backend',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
    topics: [
      { id: 't-2-1', title: 'Django Models, Migrations & QuerySet optimization', completed: false },
      { id: 't-2-2', title: 'DRF Serializers & ViewSets', completed: false },
      { id: 't-2-3', title: 'JWT Authentication & Permission classes', completed: false },
      { id: 't-2-4', title: 'Celery background workers & Redis caching', completed: false },
    ],
  },
  {
    id: 'sprint-3',
    name: 'DSA Mastery: Trees, Graphs & Dynamic Programming',
    description: 'Coding interview patterns and problem solving intuition',
    category: 'Algorithms',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
    topics: [
      { id: 't-3-1', title: 'Binary Search & Two Pointers patterns', completed: false },
      { id: 't-3-2', title: 'Tree traversals & Lowest Common Ancestor', completed: false },
      { id: 't-3-3', title: 'Graph BFS/DFS, Dijkstra & Topological Sort', completed: false },
      { id: 't-3-4', title: '1D and 2D Dynamic Programming classics', completed: false },
    ],
  },
  {
    id: 'sprint-4',
    name: 'High-Scale System Design & Database Sharding',
    description: 'Designing distributed systems, caching layers, and database partitioning',
    category: 'Architecture',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
    topics: [
      { id: 't-4-1', title: 'Load balancing, CDN, and DNS routing', completed: false },
      { id: 't-4-2', title: 'CAP Theorem & Eventual Consistency', completed: false },
      { id: 't-4-3', title: 'Database Sharding, Replication & Read Replicas', completed: false },
      { id: 't-4-4', title: 'Rate Limiter & Notification Service Design', completed: false },
    ],
  },
  {
    id: 'sprint-5',
    name: 'AI Agent Integrations & Real-Time WebSockets',
    description: 'LLM tool calling, structured outputs, and real-time streaming architectures',
    category: 'AI & Systems',
    durationWeeks: 2,
    startDate: null,
    status: 'upcoming',
    topics: [
      { id: 't-5-1', title: 'Function calling & agent loops with Gemini/Claude', completed: false },
      { id: 't-5-2', title: 'RAG architecture with Vector embeddings', completed: false },
      { id: 't-5-3', title: 'WebSockets & Server-Sent Events (SSE) streaming', completed: false },
    ],
  },
];

export const HABIT_MILESTONES: HabitMilestone[] = [
  {
    id: 'm-2h',
    hours: 2,
    title: 'First Step: Pulse & Urge Stabilizing',
    badge: '🌱',
    rewardDescription: 'The First Clean Break',
    benefitDetail: 'Heart rate settles and breathing steadies. You acknowledged the impulse without surrendering to it!',
  },
  {
    id: 'm-4h',
    hours: 4,
    title: 'Craving Surfer',
    badge: '🌊',
    rewardDescription: 'Urge Surfing Master',
    benefitDetail: 'Oxygen balance normalizes. You successfully interrupted the automatic subconscious dopamine habit loop!',
  },
  {
    id: 'm-8h',
    hours: 8,
    title: 'Mental Clarity Rising',
    badge: '💨',
    rewardDescription: 'Clear Breath & Mind',
    benefitDetail: 'Brain fog begins clearing. Natural alertness rises as your nervous system stops expecting the compulsive fix.',
  },
  {
    id: 'm-12h',
    hours: 12,
    title: 'Half-Day Hero',
    badge: '☀️',
    rewardDescription: '12-Hour Bronze Shield',
    benefitDetail: 'A full half day clean! Cellular and nervous system recovery begins. Your baseline dopamine reset is officially in motion.',
  },
  {
    id: 'm-24h',
    hours: 24,
    title: 'One Full Day Free',
    badge: '🏆',
    rewardDescription: '24-Hour Golden Trophy',
    benefitDetail: '24 hours without the bad habit! Acute agitation peaks and begins to level off. You proved you can overcome the impulse!',
  },
  {
    id: 'm-48h',
    hours: 48,
    title: 'Two Days Resilient',
    badge: '🔥',
    rewardDescription: 'Nerve Restoration Medal',
    benefitDetail: 'Sensory receptors and baseline focus awaken. The sharpest phase of the craving loop begins to dissolve.',
  },
  {
    id: 'm-3d',
    hours: 72,
    title: 'The 72h Peak Conquered',
    badge: '⚡',
    rewardDescription: 'Peak Conqueror Star',
    benefitDetail: '72 hours reached! Compulsive urges drop significantly as the acute cycle breaks. The hardest physiological hurdle is behind you!',
  },
  {
    id: 'm-5d',
    hours: 120,
    title: 'Executive Function Rebuilder',
    badge: '🛡️',
    rewardDescription: 'Focus Defender',
    benefitDetail: 'Your prefrontal cortex (executive control) is actively rebuilding synaptic pathways. Willpower stamina is now 3x higher than Day 1.',
  },
  {
    id: 'm-7d',
    hours: 168,
    title: 'One Week Champion!',
    badge: '🌟',
    rewardDescription: '1-Week Diamond Ribbon',
    benefitDetail: 'One full week clean! Deep restorative sleep returns. You are building true psychological freedom and self-respect.',
  },
  {
    id: 'm-10d',
    hours: 240,
    title: 'Double-Digit Dynamo',
    badge: '🚀',
    rewardDescription: 'Momentum Engine',
    benefitDetail: 'Automatic habit triggers have lost their power over you. Emotional balance and impulse stability are taking hold.',
  },
  {
    id: 'm-14d',
    hours: 336,
    title: 'Two Full Weeks Clean',
    badge: '👑',
    rewardDescription: 'Crown of Resilience',
    benefitDetail: 'Dopamine D2 receptor density is steadily up-regulating! You feel natural pleasure from learning, deep work, and simple moments.',
  },
  {
    id: 'm-21d',
    hours: 504,
    title: 'Neural Rewiring Complete',
    badge: '🧠',
    rewardDescription: 'Neuro-Architect Badge',
    benefitDetail: '21 days of neuroplasticity! The old habit pathway has weakened into dormancy, replaced by conscious choices.',
  },
  {
    id: 'm-30d',
    hours: 720,
    title: '30-Day Master Legend!',
    badge: '🎖️',
    rewardDescription: 'Grandmaster Pomo-Dino',
    benefitDetail: 'A full 30 days of self-mastery! You proved to your ADHD brain that consistency, patience, and lasting victory are 100% possible.',
  },
];

export const DEFAULT_HABIT_TRACKERS: HabitQuitTracker[] = [
  {
    id: 'habit-doomscroll',
    habitName: 'Doomscrolling & Social Media',
    quitDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    reason: 'To regain focus, mental clarity, and rebuild my dopamine baseline for learning.',
    resetsCount: 0,
    cravingsResisted: 3,
    unlockedMilestones: ['m-2h'],
  },
  {
    id: 'habit-latenight',
    habitName: 'Late-Night Screen Binging',
    quitDate: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    reason: 'To get deep restorative REM sleep and wake up without ADHD morning fog.',
    resetsCount: 0,
    cravingsResisted: 2,
    unlockedMilestones: ['m-2h', 'm-4h', 'm-8h', 'm-12h', 'm-24h'],
  },
];

export const DEFAULT_HABIT_TRACKER: HabitQuitTracker = DEFAULT_HABIT_TRACKERS[0];

export const DEFAULT_STREAK: Streak = {
  current: 0,
  best: 0,
  lastCompletedDate: null,
  lastPausedDate: null,
};

export const DEFAULT_TODOS: TodoItem[] = [
  {
    id: 'habit-tidy',
    text: 'Tidy up bathroom and bedroom',
    priority: 'A',
    status: 'open',
    coins: 30,
    category: 'habit',
    colorTheme: 'amber',
    createdDate: getTodayDateString(),
  },
  {
    id: 'habit-workout',
    text: 'Physical activity (sports, workout, etc.)',
    priority: 'B',
    status: 'open',
    coins: 40,
    category: 'habit',
    colorTheme: 'yellow',
    createdDate: getTodayDateString(),
  },
  {
    id: 'habit-hygiene',
    text: 'Personal hygiene and skincare routine',
    priority: 'C',
    status: 'open',
    coins: 50,
    category: 'habit',
    colorTheme: 'green',
    createdDate: getTodayDateString(),
  },
  {
    id: 'goal-system-design',
    text: 'Architect scalable real-time streaming pipeline',
    priority: 'A',
    status: 'open',
    coins: 100,
    category: 'goal',
    colorTheme: 'amber',
    createdDate: getTodayDateString(),
  },
  {
    id: 'goal-deep-work',
    text: 'Complete 4 deep work focus blocks',
    priority: 'B',
    status: 'open',
    coins: 60,
    category: 'goal',
    colorTheme: 'yellow',
    createdDate: getTodayDateString(),
  },
];

export const INITIAL_APP_DATA: AppData = {
  version: 4,
  routineBlocks: DEFAULT_WEEKDAY_BLOCKS,
  routineSets: DEFAULT_ROUTINE_SETS,
  routineSchedule: DEFAULT_ROUTINE_SCHEDULE,
  sprints: DEFAULT_SPRINTS,
  todos: DEFAULT_TODOS,
  dailyLogs: {},
  brainDump: [],
  streak: DEFAULT_STREAK,
  weeklyRetroNotes: {},
  settings: {
    notificationsEnabled: false,
    soundEnabled: true,
    theme: 'system',
    pomodoro: {
      focusMinutes: 25,
      restMinutes: 5,
    },
  },
  lastAutoExportDate: null,
  habitTracker: DEFAULT_HABIT_TRACKER,
  habitTrackers: DEFAULT_HABIT_TRACKERS,
  dreamAssessment: null,
  pomodoroStats: {
    todayCompleted: 0,
    lastDate: getTodayDateString(),
    totalCompleted: 0,
  },
  coins: 25982,
  userName: 'Kendrick',
  redemptions: [],
};

// Default checklist items per block category (used when a block has no custom subtasks)
export const DEFAULT_SUBTASKS_BY_CATEGORY: Record<Category, string[]> = {
  learning: ['Open notes & course', 'Watch / read one lesson', 'Write 3 key takeaways'],
  gym: ['Wake up & hydrate', 'Morning workout', 'Shower & get ready', 'Read 10 pages', 'Healthy breakfast'],
  office: ['Pick the one hard task', 'Phone on focus mode', 'Clear inbox once'],
  project: ['Open the project', 'Ship one small change'],
  review: ['Evening review', 'Plan tomorrow', 'Screens off'],
  sleep: ['Lights out on time'],
  personal: ['Tidy up 10 minutes', 'Call family', 'Groceries / errands'],
};

export function getBlockSubtasks(block: RoutineBlock): string[] {
  return block.subtasks && block.subtasks.length > 0
    ? block.subtasks
    : DEFAULT_SUBTASKS_BY_CATEGORY[block.category] || [];
}

export const REWARDS_CATALOG: Reward[] = [
  { id: 'reward-coffee', title: 'Coffee Treat', cost: 500, image: '/art/reward_coffee.png' },
  { id: 'reward-movie', title: 'Movie Night', cost: 1000, image: '/art/reward_movie.png' },
  { id: 'reward-game', title: 'Gaming Session', cost: 1500, image: '/art/reward_game.png' },
  { id: 'reward-trip', title: 'Weekend Trip', cost: 5000, image: '/art/reward_trip.png' },
];

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
    mood: null,
    subtaskDone: {},
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
    let sprints = parsed.sprints && parsed.sprints.length > 0 ? parsed.sprints : DEFAULT_SPRINTS;
    // Ensure all sprints have a topics array
    sprints = sprints.map((s, idx) => {
      if (!s.topics || s.topics.length === 0) {
        const defaultMatch = DEFAULT_SPRINTS.find((ds) => ds.id === s.id) || DEFAULT_SPRINTS[idx];
        return {
          ...s,
          description: s.description || defaultMatch?.description || '',
          category: s.category || defaultMatch?.category || 'General',
          topics: defaultMatch?.topics || [],
        };
      }
      return s;
    });

    let rawTodos = Array.isArray(parsed.todos) ? parsed.todos : [];
    if (rawTodos.length === 0) {
      rawTodos = DEFAULT_TODOS;
    }
    const todos: TodoItem[] = rawTodos.map((t) => ({
      ...t,
      coins: t.coins ?? (t.priority === 'A' ? 30 : t.priority === 'B' ? 40 : 50),
      category: t.category ?? 'habit',
      colorTheme: t.colorTheme ?? (t.priority === 'A' ? 'amber' : t.priority === 'B' ? 'yellow' : 'green'),
    }));

    // Multiple habits migration
    let habitTrackers = parsed.habitTrackers;
    if (!habitTrackers || habitTrackers.length === 0) {
      if (parsed.habitTracker) {
        habitTrackers = [parsed.habitTracker];
      } else {
        habitTrackers = DEFAULT_HABIT_TRACKERS;
      }
    }

    const data: AppData = {
      version: 4,
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
        pomodoro: parsed.settings?.pomodoro || { focusMinutes: 25, restMinutes: 5 },
      },
      lastAutoExportDate: parsed.lastAutoExportDate || null,
      habitTracker: habitTrackers[0] || DEFAULT_HABIT_TRACKER,
      habitTrackers,
      dreamAssessment: parsed.dreamAssessment || null,
      pomodoroStats: parsed.pomodoroStats || {
        todayCompleted: 0,
        lastDate: getTodayDateString(),
        totalCompleted: 0,
      },
      coins: typeof parsed.coins === 'number' ? parsed.coins : 25982,
      userName: parsed.userName || 'Kendrick',
      redemptions: Array.isArray(parsed.redemptions) ? parsed.redemptions : [],
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
      version: parsed.version || 3,
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
      habitTracker: parsed.habitTracker || DEFAULT_HABIT_TRACKER,
      pomodoroStats: parsed.pomodoroStats || {
        todayCompleted: 0,
        lastDate: getTodayDateString(),
        totalCompleted: 0,
      },
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

