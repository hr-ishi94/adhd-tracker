import React, { useState } from 'react';
import { ArrowRight, Send, Trash2 } from 'lucide-react';
import type { Item } from '../types';
import { Page } from '../components/ui';

interface DumpScreenProps {
  items: Item[];
  todayFull: boolean;
  onAdd: (text: string) => void;
  onMoveToToday: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DumpScreen: React.FC<DumpScreenProps> = ({ items, todayFull, onAdd, onMoveToToday, onDelete }) => {
  const [text, setText] = useState('');
  const [fullNotice, setFullNotice] = useState(false);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };

  const moveToToday = (id: string) => {
    if (todayFull) {
      setFullNotice(true);
      return;
    }
    onMoveToToday(id);
  };

  return (
    <Page className="px-5">
      <header className="pt-6 pb-4 safe-top">
        <h1 className="text-[26px] font-extrabold text-warm-800 dark:text-warm-50">Dump</h1>
        <p className="text-sm text-warm-500">Empty your head. Sort it later.</p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="card rounded-2xl p-2 flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 min-w-0 bg-transparent px-3 py-3 text-base text-warm-800 dark:text-warm-50 placeholder:text-warm-400 outline-none"
        />
        <button type="submit" aria-label="Save" disabled={!text.trim()} className="btn-primary w-11 h-11 !p-0 rounded-full shrink-0 disabled:opacity-40">
          <Send className="w-5 h-5" />
        </button>
      </form>

      {fullNotice && (
        <div className="mt-3 rounded-2xl bg-honey-100 text-warm-700 text-sm px-4 py-3 flex items-center justify-between gap-3">
          <span>Today already has 3 things. Finish one first.</span>
          <button type="button" onClick={() => setFullNotice(false)} className="font-bold text-warm-800 shrink-0">
            OK
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-10 text-center text-sm text-warm-500">Nothing here. Your head is clear. 🌿</p>
      ) : (
        <ul className="mt-4 card rounded-2xl divide-y divide-[#F0E6D3] dark:divide-warm-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 pl-4 pr-2 py-2">
              <span className="flex-1 min-w-0 text-[15px] text-warm-800 dark:text-warm-100 break-words py-2">{item.text}</span>
              <button
                type="button"
                onClick={() => moveToToday(item.id)}
                className="flex items-center gap-1 px-3 h-10 rounded-xl bg-focus-50 dark:bg-warm-800 text-focus-600 text-xs font-extrabold shrink-0"
              >
                Today <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => onDelete(item.id)} aria-label="Delete" className="w-10 h-10 flex items-center justify-center rounded-xl text-warm-400 hover:text-warm-700 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
};
