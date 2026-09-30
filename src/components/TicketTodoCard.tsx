import React, { useRef, useState } from 'react';
import type { TodoItem } from '../types';
import { X } from 'lucide-react';
import { ART, Checkbox, CoinPill } from './ui';

interface TicketTodoCardProps {
  todo: TodoItem;
  onToggleDone: (id: string, coinsAwarded: number) => void;
  onDelete?: (id: string) => void;
}

/** Pick a 3D icon tile by keyword match of the todo text */
function iconFor(text: string): string {
  const t = text.toLowerCase();
  if (/(workout|gym|exercise|run|walk|yoga|stretch|move|sport|train)/.test(t)) return ART.iconWorkout;
  if (/(read|book|learn|study|course|lesson|note)/.test(t)) return ART.iconBook;
  return ART.iconLaptop;
}

export const TicketTodoCard: React.FC<TicketTodoCardProps> = ({ todo, onToggleDone, onDelete }) => {
  const [showRewardPop, setShowRewardPop] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const pressTimer = useRef<number | null>(null);

  const isDone = todo.status === 'done';
  const coins = todo.coins || (todo.priority === 'A' ? 30 : todo.priority === 'B' ? 40 : 50);
  const subtitle = `Priority ${todo.priority} • ${(todo.category || 'habit') === 'goal' ? 'Goal' : 'Daily habit'}`;

  const handleToggle = () => {
    if (!isDone) {
      setShowRewardPop(true);
      window.setTimeout(() => setShowRewardPop(false), 1200);
      onToggleDone(todo.id, coins);
    } else {
      onToggleDone(todo.id, -coins);
    }
  };

  // Long-press (touch) reveals the delete button
  const startPress = () => {
    if (!onDelete) return;
    pressTimer.current = window.setTimeout(() => setShowDelete(true), 550);
  };
  const cancelPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  return (
    <div
      className="relative group select-none"
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onContextMenu={(e) => {
        if (onDelete) {
          e.preventDefault();
          setShowDelete(true);
        }
      }}
    >
      {showRewardPop && (
        <div className="absolute -top-3 right-4 z-30 pointer-events-none animate-pop-in px-2.5 py-0.5 rounded-full bg-honey-300 text-warm-800 font-extrabold text-xs shadow border border-white">
          +{coins} coins
        </div>
      )}

      <div
        onClick={handleToggle}
        className={`card-honey relative flex items-center gap-3 min-h-[76px] pl-3 pr-3 py-2.5 cursor-pointer transition-all duration-200 ${
          isDone ? 'opacity-60 saturate-50' : 'active:scale-[0.99]'
        }`}
      >
        {/* Ticket-stub notches */}
        <span aria-hidden="true" className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F7F0E3] dark:bg-warm-950" />
        <span aria-hidden="true" className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F7F0E3] dark:bg-warm-950" />

        <img src={iconFor(todo.text)} alt="" aria-hidden="true" className="w-[52px] h-[52px] shrink-0 object-contain select-none pointer-events-none" />

        <div className="flex-1 min-w-0">
          <p
            className={`text-[15px] font-bold leading-snug break-words ${
              isDone ? 'line-through text-warm-500 dark:text-warm-400' : 'text-warm-800 dark:text-warm-50'
            }`}
          >
            {todo.text}
          </p>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5 truncate">{subtitle}</p>
        </div>

        <Checkbox
          checked={isDone}
          onChange={handleToggle}
          label={isDone ? 'Mark as open' : 'Mark as completed'}
          className="shrink-0"
        />

        <span aria-hidden="true" className="self-stretch w-0 border-l-2 border-dashed border-honey-400/60 dark:border-warm-700 my-1" />

        <CoinPill amount={coins} muted={isDone} />
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowDelete(false);
            onDelete(todo.id);
          }}
          onBlur={() => setShowDelete(false)}
          title="Delete item"
          aria-label="Delete item"
          className={`absolute -top-2 -right-1 z-20 w-6 h-6 rounded-full bg-warm-800 text-white dark:bg-warm-100 dark:text-warm-900 flex items-center justify-center shadow transition-opacity ${
            showDelete ? 'opacity-100' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:opacity-100'
          }`}
        >
          <X className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      )}
    </div>
  );
};
