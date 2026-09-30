import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { AppData, AppSettings, Theme } from '../types';
import { downloadBackupFile, parseBackup } from '../lib/storage';

interface SettingsSheetProps {
  isOpen: boolean;
  appData: AppData;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onReplaceData: (data: AppData) => void;
  onReset: () => void;
  onClose: () => void;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-3">
    <span className="text-sm font-semibold text-warm-700 dark:text-warm-200">{label}</span>
    {children}
  </div>
);

function Pills<T extends string | number>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={String(o.id)} type="button" onClick={() => onChange(o.id)} className={`seg-item ${value === o.id ? 'seg-item-active' : ''}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ isOpen, appData, onUpdateSettings, onReplaceData, onReset, onClose }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState('');
  if (!isOpen) return null;
  const s = appData.settings;

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    const data = parseBackup(await file.text());
    if (!data) {
      setImportError("That file doesn't look like a backup.");
      return;
    }
    setImportError('');
    onReplaceData(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#FFFCF6] dark:bg-warm-900 rounded-t-[28px] px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-extrabold text-warm-800 dark:text-warm-50">Settings</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full flex items-center justify-center text-warm-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-[#F0E6D3] dark:divide-warm-800">
          <Row label="Your name">
            <input
              value={s.name}
              onChange={(e) => onUpdateSettings({ name: e.target.value })}
              placeholder="Name"
              className="w-40 rounded-xl border border-[#F0E6D3] dark:border-warm-700 bg-white dark:bg-warm-850 px-3 py-2 text-sm text-warm-800 dark:text-warm-50 outline-none focus:border-focus-400"
            />
          </Row>
          <Row label="Focus length">
            <Pills options={[{ id: 10 as const, label: '10 min' }, { id: 25 as const, label: '25 min' }]} value={s.focusMinutes} onChange={(v) => onUpdateSettings({ focusMinutes: v })} />
          </Row>
          <Row label="Sound">
            <button
              type="button"
              role="switch"
              aria-checked={s.sound}
              onClick={() => onUpdateSettings({ sound: !s.sound })}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${s.sound ? 'bg-focus-600' : 'bg-warm-300 dark:bg-warm-700'}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${s.sound ? 'translate-x-5' : ''}`} />
            </button>
          </Row>
          <Row label="Theme">
            <Pills<Theme>
              options={[{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }, { id: 'system', label: 'Auto' }]}
              value={s.theme}
              onChange={(v) => onUpdateSettings({ theme: v })}
            />
          </Row>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => downloadBackupFile(appData)} className="card rounded-2xl py-3 text-sm font-bold text-warm-800 dark:text-warm-100">
            Export data
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="card rounded-2xl py-3 text-sm font-bold text-warm-800 dark:text-warm-100">
            Import data
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        </div>
        {importError && <p className="mt-2 text-xs text-rose-600">{importError}</p>}

        <div className="mt-4">
          {confirmReset ? (
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmReset(false)} className="flex-1 card rounded-2xl py-3 text-sm font-bold text-warm-700">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                  onClose();
                }}
                className="flex-1 rounded-2xl py-3 text-sm font-bold bg-rose-600 text-white"
              >
                Yes, erase everything
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="w-full py-3 text-sm font-bold text-rose-600">
              Reset all data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
