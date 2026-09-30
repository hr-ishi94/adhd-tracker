import React, { useState } from 'react';
import type { BrainDumpItem, BrainDumpTag, TodoItem, TodoPriority } from '../types';
import {
  Trash2,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  Aperture,
  Wand2,
  Mic,
  Send,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { canAddTodo, getTodosByPriority } from '../lib/storage';
import { Checkbox, Page, ScreenHeader } from '../components/ui';

interface InboxScreenProps {
  items: BrainDumpItem[];
  todos: TodoItem[];
  onDeleteItem: (id: string) => void;
  onSaveItem: (text: string, tag?: BrainDumpTag) => void;
  onSetTag: (id: string, tag: BrainDumpTag) => void;
  onConvertToTodo: (item: BrainDumpItem, priority: TodoPriority) => boolean;
  onSetAsPrimaryFocus: (item: BrainDumpItem) => void;
  onClearAllDone: () => void;
}

type Mode = 'quick' | 'capture' | 'process';
type Filter = 'all' | 'task' | 'idea' | 'worry' | 'later';

const TAG_ORDER: BrainDumpTag[] = ['task', 'idea', 'worry', 'later', 'personal', 'work'];

const TAG_STYLES: Record<BrainDumpTag, { label: string; className: string }> = {
  task: { label: 'Task', className: 'bg-[#E3EEFA] text-[#2F6FB0] dark:bg-sky-950/60 dark:text-sky-300' },
  idea: { label: 'Idea', className: 'bg-honey-100 text-[#8A5A12] dark:bg-honey-500/20 dark:text-honey-300' },
  personal: { label: 'Personal', className: 'bg-[#FDE5D3] text-focus-700 dark:bg-focus-900/40 dark:text-focus-300' },
  work: { label: 'Work', className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  worry: { label: 'Worry', className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  later: { label: 'Later', className: 'bg-warm-200 text-warm-700 dark:bg-warm-800 dark:text-warm-300' },
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'task', label: 'Tasks' },
  { id: 'idea', label: 'Ideas' },
  { id: 'worry', label: 'Worries' },
  { id: 'later', label: 'Later' },
];

const MODES: { id: Mode; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'quick', label: 'Quick', Icon: Zap },
  { id: 'capture', label: 'Capture', Icon: Aperture },
  { id: 'process', label: 'Process', Icon: Wand2 },
];

const nextTag = (tag?: BrainDumpTag): BrainDumpTag =>
  tag ? TAG_ORDER[(TAG_ORDER.indexOf(tag) + 1) % TAG_ORDER.length] : TAG_ORDER[0];

const relativeDate = (item: BrainDumpItem) => {
  if (item.tag === 'later') return 'Later';
  try {
    const d = new Date(item.createdAt);
    const today = new Date();
    const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((startOf(today) - startOf(d)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export const InboxScreen: React.FC<InboxScreenProps> = ({
  items,
  todos,
  onDeleteItem,
  onSaveItem,
  onSetTag,
  onConvertToTodo,
  onSetAsPrimaryFocus,
  onClearAllDone,
}) => {
  const [mode, setMode] = useState<Mode>('quick');
  const [filter, setFilter] = useState<Filter>('all');
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<BrainDumpTag | undefined>(undefined);
  const [activeConvertItemId, setActiveConvertItemId] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<{ id: string; msg: string } | null>(null);

  const aCount = getTodosByPriority(todos, 'A').length;
  const bCount = getTodosByPriority(todos, 'B').length;
  const cCount = getTodosByPriority(todos, 'C').length;

  const convertedItems = items.filter((i) => i.convertedToTask);
  const filtered = items.filter((i) => filter === 'all' || i.tag === filter);
  const activeFiltered = filtered.filter((i) => !i.convertedToTask);
  const convertedFiltered = filtered.filter((i) => i.convertedToTask);
  const processItems = items.filter((i) => !i.convertedToTask);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSaveItem(t, mode === 'capture' ? selectedTag : undefined);
    setText('');
  };

  const handleSelectPriority = (item: BrainDumpItem, priority: TodoPriority) => {
    if (!canAddTodo(todos, priority)) {
      setConvertError({
        id: item.id,
        msg: `Tier ${priority} is full (3/3 max). Demote or complete one first.`,
      });
      setTimeout(() => setConvertError(null), 4000);
      return;
    }
    const success = onConvertToTodo(item, priority);
    if (success) {
      setActiveConvertItemId(null);
      setConvertError(null);
    }
  };

  const toggleActions = (id: string) => {
    setConvertError(null);
    setActiveConvertItemId((cur) => (cur === id ? null : id));
  };

  const priorityBtn = (item: BrainDumpItem, p: TodoPriority, label: string, count: number, tone: string) => (
    <button
      type="button"
      onClick={() => handleSelectPriority(item, p)}
      className={`py-1.5 rounded-xl text-center transition-all ${
        count >= 3 ? 'opacity-40 bg-warm-100 dark:bg-warm-800 cursor-not-allowed text-warm-500' : tone
      }`}
    >
      <div className="font-bold text-[11px]">{label}</div>
      <div className="text-[10px] opacity-75">{count}/3</div>
    </button>
  );

  const ActionsPanel: React.FC<{ item: BrainDumpItem; showClose?: boolean }> = ({ item, showClose = true }) => (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-warm-600 dark:text-warm-300">Convert to todo or focus</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDeleteItem(item.id)}
            aria-label="Delete thought"
            className="p-1 text-warm-400 hover:text-red-500 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {showClose && (
            <button
              type="button"
              onClick={() => toggleActions(item.id)}
              aria-label="Close actions"
              className="p-1 text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {priorityBtn(item, 'A', 'A · Must', aCount, 'bg-honey-100 text-[#8A5A12] dark:bg-honey-500/20 dark:text-honey-300')}
        {priorityBtn(item, 'B', 'B · Should', bCount, 'bg-[#E3EEFA] text-[#2F6FB0] dark:bg-sky-950/60 dark:text-sky-300')}
        {priorityBtn(item, 'C', 'C · Nice', cCount, 'bg-warm-100 text-warm-700 dark:bg-warm-800 dark:text-warm-200')}
        <button
          type="button"
          onClick={() => onSetAsPrimaryFocus(item)}
          title="Set as Today's One Thing"
          className="py-1.5 rounded-xl text-center bg-[#FDE5D3] text-focus-700 dark:bg-focus-900/40 dark:text-focus-300"
        >
          <div className="font-bold text-[11px] flex items-center justify-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            Focus
          </div>
          <div className="text-[10px] opacity-75">1 Thing</div>
        </button>
      </div>
      {convertError?.id === item.id && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#8A5A12] dark:text-honey-300 bg-honey-50 dark:bg-honey-500/15 p-2 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{convertError.msg}</span>
        </div>
      )}
    </div>
  );

  const TagBadge: React.FC<{ item: BrainDumpItem }> = ({ item }) => {
    const style = item.tag ? TAG_STYLES[item.tag] : null;
    return (
      <button
        type="button"
        onClick={() => onSetTag(item.id, nextTag(item.tag))}
        title="Tap to change tag"
        className={`shrink-0 px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
          style ? style.className : 'border border-dashed border-warm-300 text-warm-400 dark:border-warm-700'
        }`}
      >
        {style ? style.label : '+ Tag'}
      </button>
    );
  };

  const Row: React.FC<{ item: BrainDumpItem }> = ({ item }) => {
    const done = item.convertedToTask;
    const open = activeConvertItemId === item.id;
    return (
      <li className="py-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={done}
            label={done ? 'Converted' : 'Process this thought'}
            onChange={() => {
              if (!done) toggleActions(item.id);
            }}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-[14px] font-medium leading-snug whitespace-pre-wrap break-words ${
                done ? 'line-through text-warm-400 dark:text-warm-500' : 'text-warm-800 dark:text-warm-100'
              }`}
            >
              {item.text}
            </p>
            <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">{relativeDate(item)}</p>
          </div>
          <TagBadge item={item} />
          {done ? (
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              aria-label="Delete thought"
              className="p-1 -mr-1 text-warm-400 hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleActions(item.id)}
              aria-label="More actions"
              className="p-1 -mr-1 text-warm-400 hover:text-warm-700 dark:hover:text-warm-200"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
        {open && !done && (
          <div className="pl-[34px]">
            <ActionsPanel item={item} />
          </div>
        )}
      </li>
    );
  };

  return (
    <Page>
      <ScreenHeader
        title="Brain Dump"
        right={
          convertedItems.length > 0 ? (
            <button
              type="button"
              onClick={onClearAllDone}
              title="Clear resolved"
              aria-label="Clear resolved thoughts"
              className="w-9 h-9 rounded-full card flex items-center justify-center text-warm-600 dark:text-warm-300"
            >
              <Clock className="w-4 h-4" />
            </button>
          ) : (
            <span
              className="w-9 h-9 rounded-full card flex items-center justify-center text-warm-500 dark:text-warm-400"
              title="Offload thoughts, then process them into todos"
            >
              <Clock className="w-4 h-4" />
            </span>
          )
        }
      />

      <div className="px-5 space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-2">
          {MODES.map(({ id, label, Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all ${
                  active
                    ? 'bg-warm-800 text-warm-50 dark:bg-warm-100 dark:text-warm-900 shadow-sm'
                    : 'bg-[#F1E8D8] text-warm-600 dark:bg-warm-850 dark:text-warm-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {mode !== 'process' ? (
          <>
            {/* Capture card */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="card !rounded-[20px] p-4"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={2}
                placeholder={"What's on your mind?\ne.g. idea, worry, task, reminder..."}
                className="w-full bg-transparent text-[15px] text-warm-800 dark:text-warm-100 placeholder:text-warm-400 dark:placeholder:text-warm-500 resize-none focus:outline-none leading-relaxed"
              />
              {mode === 'capture' && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TAG_ORDER.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTag((cur) => (cur === t ? undefined : t))}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${TAG_STYLES[t].className} ${
                        selectedTag === t ? 'ring-2 ring-offset-1 ring-warm-800 dark:ring-warm-100 ring-offset-transparent' : 'opacity-80'
                      }`}
                    >
                      {TAG_STYLES[t].label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 mt-2">
                <Mic className="w-5 h-5 text-warm-400 dark:text-warm-500" aria-hidden="true" />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  aria-label="Save thought"
                  className="w-10 h-10 rounded-full bg-focus-600 hover:bg-focus-700 disabled:opacity-50 text-white flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(224,98,31,0.6)] active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </form>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`chip ${filter === f.id ? 'chip-active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-semibold text-warm-700 dark:text-warm-200">
                  {items.length === 0 ? 'Your mind is clear' : 'Nothing here yet'}
                </p>
                <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 max-w-xs mx-auto">
                  Whenever a thought distracts you, drop it above or tap the <span className="font-bold">+</span> button.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-warm-200/80 dark:divide-warm-800">
                {activeFiltered.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
                {convertedFiltered.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            )}
          </>
        ) : (
          /* Process view */
          <div className="space-y-3">
            <p className="text-xs text-warm-500 dark:text-warm-400">
              {processItems.length === 0
                ? 'Everything is processed. Nice work.'
                : `${processItems.length} thought${processItems.length === 1 ? '' : 's'} to process. Convert to A/B/C or Today's Focus.`}
            </p>
            {processItems.map((item) => (
              <div key={item.id} className="card !rounded-[20px] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-warm-800 dark:text-warm-100 whitespace-pre-wrap break-words leading-snug">
                      {item.text}
                    </p>
                    <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">{relativeDate(item)}</p>
                  </div>
                  <TagBadge item={item} />
                </div>
                <ActionsPanel item={item} showClose={false} />
              </div>
            ))}
            {convertedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearAllDone}
                className="w-full text-center text-xs font-semibold text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 py-2"
              >
                Clear {convertedItems.length} resolved
              </button>
            )}
          </div>
        )}
      </div>
    </Page>
  );
};
