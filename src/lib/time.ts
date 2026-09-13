import type { RoutineBlock } from '../types';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTimeString(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTimeFriendly(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutePad = String(m).padStart(2, '0');
  return `${hour12}:${minutePad} ${suffix}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTimeFriendly(startTime)} – ${formatTimeFriendly(endTime)}`;
}

export function isBlockActive(block: RoutineBlock, now: Date = new Date()): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = timeToMinutes(block.startTime);
  const end = timeToMinutes(block.endTime);

  if (start <= end) {
    return currentMinutes >= start && currentMinutes < end;
  } else {
    // Spans midnight, e.g. 22:30 to 05:30
    return currentMinutes >= start || currentMinutes < end;
  }
}

/**
 * Returns current active block and next upcoming block.
 */
export function getCurrentAndNextBlock(
  blocks: RoutineBlock[],
  now: Date = new Date()
): { currentBlock: RoutineBlock | null; nextBlock: RoutineBlock | null } {
  if (!blocks || blocks.length === 0) {
    return { currentBlock: null, nextBlock: null };
  }

  // Sort blocks by start time for consistent chronological evaluation
  const sorted = [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find active block
  let currentBlock: RoutineBlock | null = null;
  let currentIndex = -1;

  for (let i = 0; i < sorted.length; i++) {
    if (isBlockActive(sorted[i], now)) {
      currentBlock = sorted[i];
      currentIndex = i;
      break;
    }
  }

  let nextBlock: RoutineBlock | null = null;

  if (currentBlock && currentIndex !== -1) {
    // Next block is index + 1, wrapping around to 0
    nextBlock = sorted[(currentIndex + 1) % sorted.length];
  } else {
    // If between blocks, find first block whose start time is > currentMinutes
    for (let i = 0; i < sorted.length; i++) {
      if (timeToMinutes(sorted[i].startTime) > currentMinutes) {
        nextBlock = sorted[i];
        break;
      }
    }
    // If none found today, wrap to first block of day tomorrow
    if (!nextBlock && sorted.length > 0) {
      nextBlock = sorted[0];
    }
  }

  return { currentBlock, nextBlock };
}

/**
 * Get ISO week string, e.g. "2026-W37"
 */
export function getWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Returns an array of date strings ["YYYY-MM-DD", ...] for the last N days (default 7 days ending today).
 */
export function getLastNDays(days: number = 7, refDate: Date = new Date()): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

export function formatDayLabel(dateStr: string): { dayName: string; dayNumber: string; isToday: boolean } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const todayStr = getLastNDays(1)[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    dayName: dayNames[date.getDay()],
    dayNumber: String(d),
    isToday: dateStr === todayStr,
  };
}
