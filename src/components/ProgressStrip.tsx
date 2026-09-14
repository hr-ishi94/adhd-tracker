import React from 'react';
import type { RoutineBlock, DailyLog } from '../types';
import { Check, Minus } from 'lucide-react';

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
    <div className="w-full py-1" aria-label="Today's progress">
      <div className="flex items-center justify-between gap-1.5 py-0.5">
        {blocks.map((block) => {
          const status = dailyLog.blockStatus[block.id] || 'pending';

          // P2 #9: Dual-encoded shape + fill for colorblind accessibility
          let indicatorStyle = 'bg-warm-100 dark:bg-warm-900 border border-warm-300 dark:border-warm-700'; // pending
          let icon = null;

          if (status === 'done') {
            indicatorStyle = 'bg-focus-600 text-white border-focus-600 shadow-xs';
            icon = <Check className="w-2 h-2 stroke-[3]" />;
          } else if (status === 'skipped') {
            indicatorStyle = 'bg-warm-200 dark:bg-warm-800 border-dashed border-warm-400 dark:border-warm-600 text-warm-600 dark:text-warm-400';
            icon = <Minus className="w-2 h-2 stroke-[3]" />;
          }

          return (
            <div
              key={block.id}
              className={`h-2.5 flex-1 rounded-full flex items-center justify-center transition-all duration-300 ${indicatorStyle}`}
              title={`${block.name}: ${status}`}
            >
              {icon}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[10px] text-warm-400 dark:text-warm-500 mt-0.5 px-0.5">
        <span className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-focus-600 text-white text-[7px] font-bold">✓</span>
          {doneCount} of {total} done
        </span>
        {skippedCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-warm-200 dark:bg-warm-800 text-warm-600 dark:text-warm-400 text-[7px] font-bold">-</span>
            {skippedCount} moved past
          </span>
        )}
      </div>
    </div>
  );
};
