import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Pencil, Play, Settings } from 'lucide-react';
import type { Item } from '../types';
import { ART, Page } from '../components/ui';

interface NowScreenProps {
  name: string;
  focusMinutes: number;
  todayItems: Item[]; // open items in "today", first one is the ONE
  doneToday: Item[];
  onStart: (item: Item) => void;
  onDone: (item: Item) => void;
  onMakeOne: (id: string) => void;
  onSetFirstStep: (id: string, step: string) => void;
  onMoveToDump: (id: string) => void;
  onGoToDump: () => void;
  onOpenSettings: () => void;
}

export const NowScreen: React.FC<NowScreenProps> = ({
  name,
  focusMinutes,
  todayItems,
  doneToday,
  onStart,
  onDone,
  onMakeOne,
  onSetFirstStep,
  onMoveToDump,
  onGoToDump,
  onOpenSettings,
}) => {
  const [editingStep, setEditingStep] = useState(false);
  const [stepDraft, setStepDraft] = useState('');
  const [showDone, setShowDone] = useState(false);

  const [one, ...upNext] = todayItems;

  const saveStep = () => {
    if (one) onSetFirstStep(one.id, stepDraft.trim());
    setEditingStep(false);
  };

  return (
    <Page>
      {/* Hero */}
      <div className="relative h-48 w-full overflow-hidden hero-fade">
        <img src={ART.todayHero} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 flex items-start justify-between px-5 pt-5 safe-top">
          <div className="flex items-center gap-3">
            <img src={ART.avatar} alt="" aria-hidden="true" className="w-11 h-11 rounded-full ring-2 ring-white object-cover" />
            <div className="text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.45)]">
              <p className="text-lg font-extrabold leading-tight">Hi{name ? ` ${name}` : ''} 👋</p>
              <p className="text-xs font-semibold">One thing at a time.</p>
            </div>
          </div>
          <button type="button" onClick={onOpenSettings} aria-label="Settings" className="w-11 h-11 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-warm-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-5">
        {/* The ONE card */}
        {one ? (
          <section className="card-honey rounded-[26px] p-5 shadow-lifted">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-warm-600">Right now</p>
            <h1 className="mt-1 text-[24px] leading-tight font-extrabold text-warm-800 break-words">{one.text}</h1>

            {editingStep ? (
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveStep();
                }}
              >
                <input
                  autoFocus
                  value={stepDraft}
                  onChange={(e) => setStepDraft(e.target.value)}
                  onBlur={saveStep}
                  placeholder="Tiny first step, e.g. open the laptop"
                  className="flex-1 min-w-0 rounded-xl border border-honey-300 bg-white/80 px-3 py-2.5 text-sm text-warm-800 outline-none focus:border-focus-400"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStepDraft(one.firstStep || '');
                  setEditingStep(true);
                }}
                className="mt-3 flex items-center gap-1.5 text-left text-sm text-warm-700 min-h-[44px]"
              >
                {one.firstStep ? (
                  <span>
                    <span className="font-bold">First step:</span> {one.firstStep}
                  </span>
                ) : (
                  <span className="text-warm-500">+ Add a tiny first step</span>
                )}
                <Pencil className="w-3.5 h-3.5 text-warm-500 shrink-0" />
              </button>
            )}

            <button type="button" onClick={() => onStart(one)} className="btn-primary w-full mt-3 py-4 text-lg gap-2">
              <Play className="w-5 h-5 fill-current" /> Start {focusMinutes} min
            </button>
            <div className="mt-2 flex items-center justify-between">
              <button type="button" onClick={() => onMoveToDump(one.id)} className="text-xs font-semibold text-warm-500 px-2 py-3">
                Not today
              </button>
              <button type="button" onClick={() => onDone(one)} className="flex items-center gap-1.5 text-sm font-bold text-warm-700 px-3 py-3">
                <Check className="w-4 h-4" /> Done
              </button>
            </div>
          </section>
        ) : (
          <section className="card rounded-[26px] p-6 text-center">
            <p className="text-lg font-extrabold text-warm-800 dark:text-warm-50">Nothing planned.</p>
            <p className="text-sm text-warm-500 mt-1">That's okay. Pick one thing to start with.</p>
            <button type="button" onClick={onGoToDump} className="btn-primary mt-4 px-6 py-3">
              Pick from Dump →
            </button>
          </section>
        )}

        {/* Up next */}
        {upNext.length > 0 && (
          <section>
            <p className="text-sm font-extrabold text-warm-700 dark:text-warm-200 mb-2">Up next</p>
            <div className="card rounded-2xl divide-y divide-[#F0E6D3] dark:divide-warm-800">
              {upNext.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onMakeOne(item.id)}
                  className="w-full text-left px-4 py-3.5 min-h-[48px] text-[15px] font-semibold text-warm-800 dark:text-warm-100"
                >
                  {item.text}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-warm-500 mt-1.5 px-1">Tap one to make it the thing right now.</p>
          </section>
        )}

        {/* Done today */}
        {doneToday.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setShowDone((s) => !s)}
              className="flex items-center gap-2 text-sm font-bold text-forest-600 dark:text-forest-300 py-2"
              aria-expanded={showDone}
            >
              <Check className="w-4 h-4" /> {doneToday.length} done today
              {showDone ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showDone && (
              <ul className="mt-1 space-y-1.5 px-1">
                {doneToday.map((item) => (
                  <li key={item.id} className="text-sm text-warm-500 line-through">
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </Page>
  );
};
