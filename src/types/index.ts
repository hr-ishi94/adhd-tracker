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
  reviewWhatGotDone: string;
  reviewWhatSlipped: string;
  reviewWhy: ReviewWhyReason;
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

export type AppSettings = {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: "system" | "light" | "dark";
};

export type AppData = {
  version: number;
  routineBlocks: RoutineBlock[];
  dailyLogs: Record<string, DailyLog>;
  brainDump: BrainDumpItem[];
  streak: Streak;
  weeklyRetroNotes: Record<string, string>; // "YYYY-Wxx" -> note
  settings: AppSettings;
};

export type ScreenTab = "today" | "inbox" | "review" | "retro" | "settings";
