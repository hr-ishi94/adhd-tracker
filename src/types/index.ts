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
  | null;

export type DailyLog = {
  date: string; // "YYYY-MM-DD"
  priority: string;
  blockStatus: Record<string, BlockStatus>; // keyed by RoutineBlock.id
  blockDetails?: Record<string, BlockLogEntry>; // P0 #2: track autoResolved flag
  reviewWhatGotDone: string;
  reviewWhatSlipped: string;
  reviewWhy: ReviewWhyReason;
  notes?: string; // P1 #7: free-form evening reflection notes
  spendingPlanMatched?: boolean | null; // P2 #8: financial check-in toggle
  reviewCompletedAt?: string;
};

export type BrainDumpItem = {
  id: string;
  text: string;
  createdAt: string; // ISO timestamp
  convertedToTask: boolean;
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

export type Sprint = {
  id: string;
  name: string;
  durationWeeks: number;
  startDate: string | null; // ISO date string or null
  status: "upcoming" | "active" | "done";
  note?: string;
};

export type AppSettings = {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: "system" | "light" | "dark";
};

export type AppData = {
  version: number;
  routineBlocks: RoutineBlock[]; // kept for backwards-compatibility
  routineSets: RoutineSet[]; // P1 #3: day-of-week routine sets
  routineSchedule: RoutineSchedule; // mapping day -> routineSetId
  sprints: Sprint[]; // P1 #5: 2-week sprint roadmap
  dailyLogs: Record<string, DailyLog>;
  brainDump: BrainDumpItem[];
  streak: Streak;
  weeklyRetroNotes: Record<string, string>; // "YYYY-Wxx" -> note
  settings: AppSettings;
  lastAutoExportDate: string | null; // P0 #1: auto weekly backup
};

export type ScreenTab = "today" | "inbox" | "review" | "retro" | "settings" | "roadmap";
