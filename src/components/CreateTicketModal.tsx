import React, { useState } from 'react';
import type { TodoPriority, TodoCategory, TicketColorTheme } from '../types';
import { X, Sparkles } from 'lucide-react';
import { CoinIcon, SegmentedTabs } from './ui';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: TodoCategory;
  onAdd: (
    text: string,
    priority: TodoPriority,
    coins: number,
    category: TodoCategory,
    colorTheme: TicketColorTheme
  ) => boolean;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'habit',
  onAdd,
}) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<TodoCategory>(defaultCategory);
  const [coins, setCoins] = useState<number>(30);
  const [colorTheme, setColorTheme] = useState<TicketColorTheme>('amber');

  if (!isOpen) return null;

  const presets = [
    { label: '30 Coins', value: 30, color: 'amber' as TicketColorTheme, priority: 'A' as TodoPriority },
    { label: '40 Coins', value: 40, color: 'yellow' as TicketColorTheme, priority: 'B' as TodoPriority },
    { label: '50 Coins', value: 50, color: 'green' as TicketColorTheme, priority: 'C' as TodoPriority },
    { label: '100 Coins', value: 100, color: 'blue' as TicketColorTheme, priority: 'A' as TodoPriority },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const matchedPreset = presets.find((p) => p.value === coins);
    const priority = matchedPreset ? matchedPreset.priority : (coins >= 50 ? 'A' : 'B');

    const success = onAdd(text.trim(), priority, coins, category, colorTheme);
    if (success) {
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-warm-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#FFFCF6] dark:bg-warm-900 rounded-t-[28px] sm:rounded-[28px] p-5 pb-8 sm:pb-5 shadow-2xl border border-warm-200 dark:border-warm-800 space-y-5 animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-honey-100 dark:bg-warm-800 text-honey-500 dark:text-honey-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-warm-800 dark:text-warm-50">
                New Priority Ticket
              </h3>
              <p className="text-xs text-warm-500">
                Earn coins upon completion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Toggle */}
          <div>
            <label className="block text-xs font-bold text-warm-500 dark:text-warm-400 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <SegmentedTabs
              options={[
                { id: 'habit' as TodoCategory, label: 'Daily habit' },
                { id: 'goal' as TodoCategory, label: 'Goal' },
              ]}
              value={category}
              onChange={setCategory}
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-warm-500 dark:text-warm-400 mb-1.5 uppercase tracking-wider">
              Action Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Tidy up desk and bedroom"
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-warm-850 border border-warm-200 dark:border-warm-700 text-warm-800 dark:text-warm-100 placeholder:text-warm-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-focus-400"
            />
          </div>

          {/* Coin Reward Presets */}
          <div>
            <label className="block text-xs font-bold text-warm-500 dark:text-warm-400 mb-1.5 uppercase tracking-wider">
              Coin Reward & Ticket Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const isSelected = coins === p.value;
                const colors = {
                  amber: 'border-focus-400 bg-focus-50 text-focus-700 dark:bg-focus-900/30 dark:text-focus-300',
                  yellow: 'border-honey-400 bg-honey-50 text-warm-800 dark:bg-warm-850 dark:text-honey-200',
                  green: 'border-forest-400 bg-forest-50 text-forest-700 dark:bg-forest-900/40 dark:text-forest-300',
                  blue: 'border-sky-400 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
                }[p.color];

                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setCoins(p.value);
                      setColorTheme(p.color);
                    }}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between font-bold text-xs sm:text-sm transition-all ${
                      isSelected
                        ? `${colors} shadow-xs scale-[1.02]`
                        : 'border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-850 text-warm-600 dark:text-warm-400'
                    }`}
                  >
                    <span>{p.label}</span>
                    <CoinIcon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-sm font-bold text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Add Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
