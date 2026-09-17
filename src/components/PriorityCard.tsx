import React, { useState, useEffect } from 'react';
import { Target, Check } from 'lucide-react';

interface PriorityCardProps {
  priority: string;
  onUpdatePriority: (newPriority: string) => void;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({
  priority,
  onUpdatePriority,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(priority);

  useEffect(() => {
    setVal(priority);
  }, [priority]);

  const handleSave = () => {
    setIsEditing(false);
    onUpdatePriority(val.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setVal(priority);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className="bg-white dark:bg-warm-850 rounded-2xl p-3.5 sm:p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft transition-all"
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400">
            <Target className="w-4 h-4 text-focus-600 dark:text-focus-500" />
            <span>Today's One Thing</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs sm:text-sm font-bold text-warm-400 hover:text-focus-600 dark:hover:text-focus-400 transition-colors px-1"
            >
              {priority ? 'Edit' : 'Set'}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder="What is the single thing that matters most today?"
              autoFocus
              className="flex-1 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 text-sm sm:text-base font-medium rounded-xl px-3.5 py-2.5 border border-warm-300 dark:border-warm-700 focus:outline-none focus:ring-2 focus:ring-focus-500"
            />
            <button
              onClick={handleSave}
              className="p-2.5 bg-focus-600 hover:bg-focus-700 text-white rounded-xl transition-colors shrink-0 shadow-xs"
              aria-label="Save priority"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer group pt-1"
          >
            {priority ? (
              <p className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100 leading-snug group-hover:text-focus-600 dark:group-hover:text-focus-400 transition-colors">
                {priority}
              </p>
            ) : (
              <p className="text-sm sm:text-base text-warm-400 dark:text-warm-500 italic py-0.5">
                Tap to set today's primary focus...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
