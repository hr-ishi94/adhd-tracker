import React from 'react';
import type { RoutineBlock, DailyLog } from '../types';

interface ProgressStripProps {
  blocks: RoutineBlock[];
  dailyLog: DailyLog;
}

export const ProgressStrip: React.FC<ProgressStripProps> = ({ blocks, dailyLog }) => {
  if (!blocks || blocks.length === 0) return null;

  const total = blocks.length;
  let doneCount = 0;
  let skippedCount = 0;

  blocks.forEach((b) => {
    const status = dailyLog.blockStatus[b.id];
    if (status === 'done') doneCount++;
    else if (status === 'skipped') skippedCount++;
  });

  return (
    <div className="w-full pt-2 pb-1 px-4 max-w-md mx-auto" aria-label="Today's progress">
      <div className="flex items-center justify-between gap-1.5 py-1">
        {blocks.map((block) => {
          const status = dailyLog.blockStatus[block.id] || 'pending';

          let indicatorStyle = 'bg-warm-200 dark:bg-warm-800'; // pending
          if (status === 'done') {
            indicatorStyle = 'bg-focus-500 dark:bg-focus-500'; // warm confident done
          } else if (status === 'skipped') {
            indicatorStyle = 'bg-warm-300 dark:bg-warm-700 opacity-60'; // neutral skipped (no shame red)
          }

          return (
            <div
              key={block.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${indicatorStyle}`}
              title={`${block.name}: ${status}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[11px] text-warm-400 dark:text-warm-500 mt-1 px-0.5">
        <span>{doneCount} of {total} done</span>
        {skippedCount > 0 && <span>{skippedCount} moved past</span>}
      </div>
    </div>
  );
};
