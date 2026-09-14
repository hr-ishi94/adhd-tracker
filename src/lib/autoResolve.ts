import type { AppData, RoutineBlock, DailyLog } from '../types';
import { timeToMinutes } from './time';
import { getTodayDateString, getOrCreateDailyLog } from './storage';

/**
 * P0 #2: Missed-block auto-resolution
 * Auto-marks past-due blocks as skipped (with autoResolved: true) after end time + 30m grace period.
 * Also resolves any pending blocks from past days so historical logs never remain in pending state.
 */
export function autoResolveMissedBlocks(
  appData: AppData,
  todayBlocks: RoutineBlock[],
  now: Date = new Date()
): { data: AppData; changed: boolean } {
  const todayStr = getTodayDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

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

  // 2. Resolve today's blocks whose end time + 30 minutes grace period has passed
  const todayLog = getOrCreateDailyLog(appData, todayStr);
  const updatedTodayStatus = { ...todayLog.blockStatus };
  const updatedTodayDetails = { ...(todayLog.blockDetails || {}) };
  let todayChanged = false;

  todayBlocks.forEach((block) => {
    const currentStatus = updatedTodayStatus[block.id] || 'pending';
    if (currentStatus === 'pending') {
      const startMinutes = timeToMinutes(block.startTime);
      const endMinutes = timeToMinutes(block.endTime);

      let isPastGracePeriod = false;

      if (startMinutes <= endMinutes) {
        // Normal block within same calendar day (e.g. 09:00 - 10:00)
        // Grace period is end + 30 mins
        const graceDeadline = endMinutes + 30;
        if (currentMinutes >= graceDeadline) {
          isPastGracePeriod = true;
        }
      } else {
        // Midnight-spanning block (e.g. 22:30 - 05:30)
        // Ends in the morning at 05:30; grace period is 06:00
        const morningGrace = endMinutes + 30;
        // If current time is past morningGrace but before startMinutes (e.g. between 06:00 and 22:30)
        if (currentMinutes >= morningGrace && currentMinutes < startMinutes) {
          isPastGracePeriod = true;
        }
      }

      if (isPastGracePeriod) {
        updatedTodayStatus[block.id] = 'skipped';
        updatedTodayDetails[block.id] = { status: 'skipped', autoResolved: true };
        todayChanged = true;
      }
    }
  });

  if (todayChanged) {
    newDailyLogs[todayStr] = {
      ...todayLog,
      blockStatus: updatedTodayStatus,
      blockDetails: updatedTodayDetails,
    };
    changed = true;
  }

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
