export type Category = 
  | "learning" 
  | "gym" 
  | "office" 
  | "project" 
  | "review" 
  | "sleep" 
  | "personal";

export type RoutineBlock = {
  id: string;
  name: string;
  startTime: string; // "05:30" (24h format HH:MM)
  endTime: string;   // "07:00"
  category: Category;
  firstStep?: string; // Optional "First 10-minute step" breakdown
  subtasks?: string[]; // Checklist items shown on the day schedule
};

export type BlockStatus = "done" | "skipped" | "pending";

export type BlockLogEntry = {
  status: BlockStatus;
  autoResolved?: boolean;
};

export type ReviewWhyReason = 
  | "too_big" 
  | "bored" 
  | "no_time" 
  | "forgot" 
  | "low_energy" 
  | "other"
  | null;

export type ReviewMood = "great" | "good" | "okay" | "tough";

export type TodoPriority = "A" | "B" | "C";
export type TodoStatus = "open" | "done";

export type TicketColorTheme = "amber" | "yellow" | "green" | "blue";
export type TodoCategory = "habit" | "goal";

export type TodoItem = {
  id: string;
  text: string;
  priority: TodoPriority;
  status: TodoStatus;
  createdDate: string; // ISO date string (YYYY-MM-DD)
  completedDate?: string | null; // ISO date string (YYYY-MM-DD) when completed
  lastNudgeWeekKey?: string | null; // e.g. "2026-W38" to prevent repeated retro nagging
  coins?: number; // Coin reward when completed (e.g. 30, 40, 50)
  category?: TodoCategory; // "habit" for Daily habits or "goal" for Goals
  colorTheme?: TicketColorTheme;
};

export type DailyLog = {
  date: string; // "YYYY-MM-DD"
  priority: string;
  blockStatus: Record<string, BlockStatus>; // keyed by RoutineBlock.id
  blockDetails?: Record<string, BlockLogEntry>; // P0 #2: track autoResolved flag
  completedTodos?: TodoItem[]; // Snapshot of todos completed on this date
  reviewWhatGotDone: string;
  reviewWhatSlipped: string;
  reviewWhy: ReviewWhyReason;
  notes?: string; // P1 #7: free-form evening reflection notes
  spendingPlanMatched?: boolean | null; // P2 #8: financial check-in toggle
  reviewCompletedAt?: string;
  mood?: ReviewMood | null; // Evening review emoji check-in
  subtaskDone?: Record<string, boolean>; // keyed by `${blockId}:${index}`
};

export type BrainDumpItem = {
  id: string;
  text: string;
  createdAt: string; // ISO timestamp
  convertedToTask: boolean;
  tag?: BrainDumpTag;
};

export type BrainDumpTag = "task" | "idea" | "worry" | "later" | "personal" | "work";

export type Reward = {
  id: string;
  title: string;
  cost: number;
  image: string; // path under /art
};

export type RewardRedemption = {
  id: string;
  rewardId: string;
  cost: number;
  redeemedAt: string; // ISO timestamp
};

export type Streak = {
  current: number;
  best: number;
  lastCompletedDate: string | null;
  lastPausedDate?: string | null;
};

export type RoutineSet = {
  id: string;
  name: string; // e.g. "Weekday", "Saturday", "Sunday"
  blocks: RoutineBlock[];
};

// 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type RoutineSchedule = Record<DayOfWeek, string>; // day -> routineSetId

export type LearningTopic = {
  id: string;
  title: string;
  completed: boolean;
};

export type Sprint = {
  id: string;
  name: string;
  durationWeeks: number;
  startDate: string | null; // ISO date string or null
  status: "upcoming" | "active" | "done";
  note?: string;
  description?: string;
  category?: string;
  topics?: LearningTopic[];
};

export type WeeklyPlan = {
  id: string;
  weekNumber: number;
  skillTitle: string;
  topics: LearningTopic[];
};

export type DreamAssessment = {
  id: string;
  dreamTitle: string;
  researchStatus: 'researched' | 'in_progress' | 'starting';
  targetWeeks: number;
  startDate: string; // ISO date
  motivation: string;
  weeklyPlans: WeeklyPlan[];
};

export type HabitMilestone = {
  id: string;
  hours: number;
  title: string;
  badge: string;
  rewardDescription: string;
  benefitDetail: string;
};

export type HabitQuitTracker = {
  id: string;
  habitName: string;
  quitDate: string; // ISO string
  reason: string;
  resetsCount: number;
  cravingsResisted: number;
  unlockedMilestones: string[];
};

export type PomodoroSettings = {
  focusMinutes: number;
  restMinutes: number;
};

export type PomodoroStats = {
  todayCompleted: number;
  lastDate: string;
  totalCompleted: number;
};

export type AppSettings = {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: "system" | "light" | "dark";
  pomodoro?: PomodoroSettings;
};

export type AppData = {
  version: number;
  routineBlocks: RoutineBlock[]; // kept for backwards-compatibility
  routineSets: RoutineSet[]; // P1 #3: day-of-week routine sets
  routineSchedule: RoutineSchedule; // mapping day -> routineSetId
  sprints: Sprint[]; // P1 #5: 2-week sprint roadmap & dynamic learning curve
  todos: TodoItem[]; // Additional To-Dos with ABC priority (max 3 per letter)
  dailyLogs: Record<string, DailyLog>;
  brainDump: BrainDumpItem[];
  streak: Streak;
  weeklyRetroNotes: Record<string, string>; // "YYYY-Wxx" -> note
  settings: AppSettings;
  lastAutoExportDate: string | null; // P0 #1: auto weekly backup
  habitTracker?: HabitQuitTracker; // legacy single tracker
  habitTrackers?: HabitQuitTracker[]; // multiple bad habit cards
  dreamAssessment?: DreamAssessment | null; // Dream & Life Targets assessment
  pomodoroStats?: PomodoroStats;
  coins?: number; // Total COS coins collected (default 25982)
  userName?: string; // Display name on dashboard (default "Kendrick")
  redemptions?: RewardRedemption[]; // Rewards Store history
};

export type ScreenTab = 
  | "today" 
  | "pomodoro" 
  | "learning" 
  | "habits" 
  | "more" 
  | "inbox" 
  | "review" 
  | "retro" 
  | "settings" 
  | "roadmap"
  | "profile"
  | "schedule";

