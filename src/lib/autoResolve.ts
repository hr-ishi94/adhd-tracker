import type { AppData, RoutineBlock, DailyLog } from '../types';
import { getTodayDateString } from './storage';

/**
 * P0 #2: Missed-block auto-resolution
 * Also resolves any pending blocks from past days so historical logs never remain in pending state.
 * For today, blocks are not prematurely marked skipped so users can check them off anytime.
 */
export function autoResolveMissedBlocks(
  appData: AppData,
  _todayBlocks?: RoutineBlock[],
  now: Date = new Date()
): { data: AppData; changed: boolean } {
  const todayStr = getTodayDateString(now);

  let changed = false;
  const newDailyLogs: Record<string, DailyLog> = { ...appData.dailyLogs };

  // 1. Resolve past days: Any block from yesterday or earlier still "pending" becomes "skipped"
  Object.keys(newDailyLogs).forEach((dateStr) => {
    if (dateStr < todayStr) {
      const log = newDailyLogs[dateStr];
      let logChanged = false;
      const updatedStatus = { ...log.blockStatus };
      const updatedDetails = { ...(log.blockDetails || {}) };

      // Ensure any pending block is marked skipped
      Object.keys(updatedStatus).forEach((blockId) => {
        if (updatedStatus[blockId] === 'pending') {
          updatedStatus[blockId] = 'skipped';
          updatedDetails[blockId] = { status: 'skipped', autoResolved: true };
          logChanged = true;
        }
      });

      if (logChanged) {
        newDailyLogs[dateStr] = {
          ...log,
          blockStatus: updatedStatus,
          blockDetails: updatedDetails,
        };
        changed = true;
      }
    }
  });

  // 2. Today's blocks: Do NOT prematurely auto-mark them as skipped during the day!
  // ADHD users frequently complete tasks but only open the tracker later to check them off.
  // Today's blocks remain accessible so the user can easily mark them as Done anytime during the day.
  // They are only finalized during Evening Review or when the calendar day rolls over.

  if (!changed) {
    return { data: appData, changed: false };
  }

  return {
    data: {
      ...appData,
      dailyLogs: newDailyLogs,
    },
    changed: true,
  };
}
