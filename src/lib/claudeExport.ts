import type { AppData, ReviewWhyReason } from '../types';
import { getTodayDateString, getOrCreateDailyLog, getRoutineBlocksForDate } from './storage';

const WHY_LABELS: Record<NonNullable<ReviewWhyReason>, string> = {
  too_big: 'Task felt too big / overwhelming (Executive dysfunction)',
  bored: 'Bored / Understimulated / Dopamine deficit',
  no_time: 'Ran out of time / Unexpected interruptions',
  forgot: 'Forgot / Switched contexts mid-way',
  low_energy: 'Low physical or mental energy / Fatigue',
};

export function generateClaudeDailyAnalysis(appData: AppData, targetDate?: string): string {
  const dateStr = targetDate || getTodayDateString();
  const log = getOrCreateDailyLog(appData, dateStr);

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const activeBlocks = getRoutineBlocksForDate(appData, dateObj);
  const totalBlocks = activeBlocks.length;
  let doneCount = 0;
  let skippedCount = 0;
  let pendingCount = 0;

  const blockLines = activeBlocks.map((b) => {
    const status = log.blockStatus[b.id] || 'pending';
    const detail = log.blockDetails?.[b.id];
    let icon = '⏳';
    let statusText = 'Pending';

    if (status === 'done') {
      icon = '✅';
      statusText = 'Completed';
      doneCount++;
    } else if (status === 'skipped') {
      icon = '⏭️';
      statusText = detail?.autoResolved ? 'Skipped (Auto-resolved after grace period)' : 'Skipped / Moved Past';
      skippedCount++;
    } else {
      pendingCount++;
    }

    const stepDetail = b.firstStep ? ` (10-min action: "${b.firstStep}")` : '';
    return `- ${icon} **${b.name}** [${b.category}] (${b.startTime} – ${b.endTime}): ${statusText}${stepDetail}`;
  });

  const completionPercent = totalBlocks > 0 ? Math.round((doneCount / totalBlocks) * 100) : 0;

  // Thoughts dumped today
  const todayDumps = appData.brainDump.filter((item) => {
    return item.createdAt && item.createdAt.startsWith(dateStr);
  });

  const dumpLines = todayDumps.length > 0
    ? todayDumps.map((d) => `- "${d.text}" ${d.convertedToTask ? '(converted to priority)' : '(stored in inbox)'}`).join('\n')
    : '- None captured today';

  const whyDescription = log.reviewWhy ? (WHY_LABELS[log.reviewWhy] || log.reviewWhy) : 'None reported';

  // Financial check-in (P2 #8)
  const spendingStatus = log.spendingPlanMatched === true
    ? '✅ Matched spending plan'
    : log.spendingPlanMatched === false
    ? '⚠️ Exceeded or differed from spending plan'
    : 'Not recorded';

  // Free-form notes (P1 #7)
  const freeformNotes = log.notes ? `\n\n### 📝 Stray Thoughts & Free-form Notes\n${log.notes}` : '';

  // Active Sprint
  const activeSprint = appData.sprints?.find((s) => s.status === 'active');
  const sprintContext = activeSprint 
    ? `- **Active 2-Week Sprint:** ${activeSprint.name} (${activeSprint.durationWeeks} weeks)` 
    : '';

  return `## 🧠 Daily ADHD Routine Review — ${dayName}, ${formattedDate}

### 🎯 1. Today's One Thing (Primary Focus)
> **Goal:** ${log.priority ? log.priority : 'Not specified'}

---

### ⏱️ 2. Routine Blocks Execution (${doneCount}/${totalBlocks} Completed • ${completionPercent}%)
${blockLines.join('\n')}

**Summary:** ${doneCount} Done | ${skippedCount} Skipped | ${pendingCount} Remaining

---

### 🔍 3. Evening Review (Friction & Wins)
- **What got done:** ${log.reviewWhatGotDone || (doneCount > 0 ? 'Completed scheduled routine blocks' : 'None reported')}
- **What slipped:** ${log.reviewWhatSlipped || (skippedCount > 0 ? 'See skipped blocks above' : 'None reported')}
- **Primary friction cause:** ${whyDescription}
- **Daily Spending Plan Check:** ${spendingStatus}${freeformNotes}

---

### 📥 4. Brain Dump Items Captured Today
${dumpLines}

---

### 🔥 5. Consistency & Streak Rhythm
- **Current Streak:** ${appData.streak.current} day(s) *(Personal Best: ${appData.streak.best} days)*
${sprintContext}
- **Rule:** Missed blocks pause momentum; no shame reset.

---

### 🤖 Context & Questions for Claude (ADHD Project):
1. Based on my slipped blocks and friction source (*${whyDescription}*), what patterns or executive function bottlenecks do you notice?
2. How can I adjust tomorrow's schedule or breakdown steps to reduce start-up friction?
3. What is 1 micro-win from today I should anchor on?`;
}
