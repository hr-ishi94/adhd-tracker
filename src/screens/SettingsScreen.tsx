import React, { useState } from 'react';
import type { 
  RoutineBlock, 
  Category, 
  AppData, 
  RoutineSet, 
  DayOfWeek 
} from '../types';
import { notifications } from '../lib/notifications';
import { importAppDataJSON, downloadBackupFile } from '../lib/storage';
import { ScreenHeader, Page } from '../components/ui';
import { 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Edit2, 
  Check, 
  X, 
  Clock, 
  ShieldAlert,
  Moon,
  Sun,
  Laptop,
  Calendar,
  Copy,
  Milestone
} from 'lucide-react';

interface SettingsScreenProps {
  appData: AppData;
  onUpdateAppData: (patch: Partial<AppData>) => void;
  onOpenRoadmap: () => void;
  onResetAllData: () => void;
  onTriggerTestNotification: (block: RoutineBlock) => void;
}

const CATEGORIES: Category[] = ['learning', 'gym', 'office', 'project', 'review', 'sleep', 'personal'];
const DAYS_OF_WEEK: { day: DayOfWeek; label: string }[] = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  appData,
  onUpdateAppData,
  onOpenRoadmap,
  onResetAllData,
  onTriggerTestNotification,
}) => {
  // Currently selected routine set to inspect and edit
  const [selectedSetId, setSelectedSetId] = useState<string>(
    appData.routineSets[0]?.id || 'set-weekday'
  );

  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [isAddingNewBlock, setIsAddingNewBlock] = useState(false);
  const [isCreatingNewSet, setIsCreatingNewSet] = useState(false);
  const [newSetName, setNewSetName] = useState('');

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<Category>('learning');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const activeSet = appData.routineSets.find((s) => s.id === selectedSetId) || appData.routineSets[0];

  // Schedule mapping: Day of week -> Set ID
  const handleAssignDayToSet = (day: DayOfWeek, setId: string) => {
    const updatedSchedule = {
      ...appData.routineSchedule,
      [day]: setId,
    };
    onUpdateAppData({ routineSchedule: updatedSchedule });
    showStatus(`Assigned to ${appData.routineSets.find((s) => s.id === setId)?.name}`);
  };

  // Create new Routine Set
  const handleCreateSet = () => {
    if (!newSetName.trim()) return;
    const newSetId = `set-${Date.now()}`;
    // Clone blocks from active set as template
    const clonedBlocks = activeSet ? activeSet.blocks.map((b) => ({ ...b, id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` })) : [];
    const newSet: RoutineSet = {
      id: newSetId,
      name: newSetName.trim(),
      blocks: clonedBlocks,
    };
    onUpdateAppData({
      routineSets: [...appData.routineSets, newSet],
    });
    setSelectedSetId(newSetId);
    setIsCreatingNewSet(false);
    setNewSetName('');
    showStatus(`Created set "${newSet.name}"`);
  };

  // P1 #4: Copy routine forward
  const handleCopyRoutineForward = () => {
    if (!activeSet) return;
    showStatus(`Routine times for "${activeSet.name}" locked for all upcoming days using this set.`);
  };

  // Block management for the selected set
  const handleStartAddBlock = () => {
    setName('');
    setStartTime('09:00');
    setEndTime('10:00');
    setCategory('learning');
    setIsAddingNewBlock(true);
    setEditingBlock(null);
  };

  const handleStartEditBlock = (b: RoutineBlock) => {
    setName(b.name);
    setStartTime(b.startTime);
    setEndTime(b.endTime);
    setCategory(b.category);
    setEditingBlock(b);
    setIsAddingNewBlock(false);
  };

  const handleSaveBlock = () => {
    if (!name.trim() || !activeSet) return;

    let updatedBlocks: RoutineBlock[];
    if (editingBlock) {
      updatedBlocks = activeSet.blocks.map((b) =>
        b.id === editingBlock.id
          ? { ...b, name: name.trim(), startTime, endTime, category }
          : b
      );
    } else {
      const newBlock: RoutineBlock = {
        id: `block-${Date.now()}`,
        name: name.trim(),
        startTime,
        endTime,
        category,
      };
      updatedBlocks = [...activeSet.blocks, newBlock];
    }

    const updatedSets = appData.routineSets.map((s) =>
      s.id === activeSet.id ? { ...s, blocks: updatedBlocks } : s
    );

    onUpdateAppData({
      routineSets: updatedSets,
      // If weekday set was edited, keep legacy routineBlocks synced
      routineBlocks: activeSet.id === 'set-weekday' ? updatedBlocks : appData.routineBlocks,
    });

    setEditingBlock(null);
    setIsAddingNewBlock(false);
    showStatus(editingBlock ? 'Block updated' : 'Block added');
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!activeSet || activeSet.blocks.length <= 1) {
      alert('You need at least one routine block in this set.');
      return;
    }
    const updatedBlocks = activeSet.blocks.filter((b) => b.id !== blockId);
    const updatedSets = appData.routineSets.map((s) =>
      s.id === activeSet.id ? { ...s, blocks: updatedBlocks } : s
    );

    onUpdateAppData({
      routineSets: updatedSets,
      routineBlocks: activeSet.id === 'set-weekday' ? updatedBlocks : appData.routineBlocks,
    });
    showStatus('Block removed');
  };

  const handleToggleNotifications = async () => {
    if (!notifications.isSupported()) {
      alert('Notifications are not supported on this browser or platform.');
      return;
    }

    if (!appData.settings.notificationsEnabled) {
      const granted = await notifications.requestPermission();
      if (granted) {
        onUpdateAppData({
          settings: { ...appData.settings, notificationsEnabled: true },
        });
        showStatus('Notifications enabled');
      } else {
        alert('Notification permission was not granted. Please check browser permissions.');
      }
    } else {
      onUpdateAppData({
        settings: { ...appData.settings, notificationsEnabled: false },
      });
      showStatus('Notifications disabled');
    }
  };

  const handleExportJSON = () => {
    downloadBackupFile(appData, 'daily-focus-manual-backup');
    showStatus('Data exported successfully');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importAppDataJSON(content);
      if (res.success && res.data) {
        onUpdateAppData(res.data);
        showStatus('Data imported successfully');
      } else {
        alert(`Import failed: ${res.error || 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const confirm1 = window.confirm('Are you sure you want to reset all routine and history data?');
    if (confirm1) {
      onResetAllData();
      showStatus('All data has been reset to defaults');
    }
  };

  const sectionLabel = 'text-[11px] font-bold uppercase tracking-wider text-warm-500 dark:text-warm-400 px-1 mb-1.5';
  const inputCls =
    'w-full bg-white dark:bg-warm-900 text-xs rounded-xl px-3 py-2 border border-warm-200 dark:border-warm-700 text-warm-800 dark:text-warm-100 focus:outline-none focus:border-focus-500';
  const softBtn =
    'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-200 text-xs font-bold transition-colors';

  const themeOptions = [
    { id: 'system' as const, label: 'System', icon: Laptop },
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
  ];

  return (
    <Page>
      <ScreenHeader title="Settings" subtitle="Customize routines, reminders & roadmap" />

      <div className="px-5 space-y-5">
        {statusMessage && (
          <div role="status" className="card-honey px-4 py-2.5 text-xs font-bold text-warm-800 dark:text-honey-100 text-center">
            {statusMessage}
          </div>
        )}

        {/* Profile */}
        <section>
          <h2 className={sectionLabel}>Profile</h2>
          <div className="card p-4">
            <label htmlFor="display-name" className="block text-xs font-bold text-warm-800 dark:text-warm-100 mb-1.5">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={appData.userName ?? ''}
              onChange={(e) => onUpdateAppData({ userName: e.target.value })}
              placeholder="Your name"
              className={inputCls}
            />
          </div>
        </section>

        {/* Learning roadmap */}
        <section>
          <h2 className={sectionLabel}>Learning</h2>
          <button
            type="button"
            onClick={onOpenRoadmap}
            className="card w-full p-3.5 flex items-center justify-between gap-3 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-focus-100 text-focus-600 dark:bg-focus-950/50 dark:text-focus-300">
                <Milestone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-warm-800 dark:text-warm-50 flex items-center gap-1.5">
                  <span>2-Week Sprint Roadmap</span>
                  <span className="chip text-[9px] uppercase">Curriculum</span>
                </p>
                <p className="text-[11px] text-warm-500 dark:text-warm-400 truncate">
                  Track 7 sprints (Next.js, Django, DSA, System Design...)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-focus-600 dark:text-focus-400 shrink-0">View →</span>
          </button>
        </section>

        {/* Routine sets */}
        <section>
          <h2 className={sectionLabel}>Routines</h2>
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-warm-800 dark:text-warm-50 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-focus-600" />
                  <span>Day-of-Week Routine Sets</span>
                </p>
                <p className="text-[11px] text-warm-500 dark:text-warm-400">
                  Different schedules for Weekdays vs. Saturday/Sunday
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNewSet(true)}
                className="shrink-0 text-[11px] font-bold text-focus-600 dark:text-focus-400 flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Set</span>
              </button>
            </div>

            {isCreatingNewSet && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="e.g. Work From Home"
                  autoFocus
                  className={`${inputCls} flex-1`}
                />
                <button type="button" onClick={handleCreateSet} className="btn-pill">
                  Add
                </button>
                <button type="button" onClick={() => setIsCreatingNewSet(false)} aria-label="Cancel" className="p-1 text-warm-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Day of Week assignment matrix */}
            <div className="grid grid-cols-7 gap-1 text-center pt-3 border-t border-warm-200/70 dark:border-warm-800">
              {DAYS_OF_WEEK.map(({ day, label }) => {
                const assignedSetId = appData.routineSchedule?.[day];
                const assignedSet = appData.routineSets.find((s) => s.id === assignedSetId);
                const isToday = new Date().getDay() === day;

                return (
                  <div key={day} className="flex flex-col items-center">
                    <span className={`text-[10px] font-bold ${isToday ? 'text-focus-600' : 'text-warm-500'}`}>{label}</span>
                    <select
                      value={assignedSetId}
                      onChange={(e) => handleAssignDayToSet(day, e.target.value)}
                      className={`w-full mt-1 text-[9px] font-semibold rounded-lg px-0.5 py-1 border text-center truncate ${
                        isToday
                          ? 'bg-focus-50 border-focus-300 text-focus-700 dark:bg-focus-950/40 dark:border-focus-700 dark:text-focus-300'
                          : 'bg-white border-warm-200 text-warm-700 dark:bg-warm-900 dark:border-warm-700 dark:text-warm-200'
                      }`}
                      title={`${label}: ${assignedSet?.name}`}
                    >
                      {appData.routineSets.map((set) => (
                        <option key={set.id} value={set.id}>
                          {set.name.slice(0, 4)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Routine Set selector */}
            <div className="pt-3 border-t border-warm-200/70 dark:border-warm-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-warm-600 dark:text-warm-400">Edit Routine Blocks for:</span>
                <button
                  type="button"
                  onClick={handleCopyRoutineForward}
                  title="Apply this set's timings forward to all upcoming days using this set"
                  className="text-[10px] text-focus-600 dark:text-focus-400 flex items-center gap-1 font-bold"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy forward</span>
                </button>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {appData.routineSets.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => setSelectedSetId(set.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedSetId === set.id
                        ? 'bg-focus-600 text-white'
                        : 'bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:bg-warm-200'
                    }`}
                  >
                    {set.name} ({set.blocks.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Blocks inside activeSet */}
            {activeSet && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-warm-800 dark:text-warm-100">{activeSet.name} Schedule</span>
                  {!isAddingNewBlock && !editingBlock && (
                    <button type="button" onClick={handleStartAddBlock} className="btn-pill flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      <span>Add Block</span>
                    </button>
                  )}
                </div>

                {(isAddingNewBlock || editingBlock) && (
                  <div className="p-3 rounded-2xl bg-warm-50 dark:bg-warm-900 border border-focus-300 dark:border-focus-700 space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-warm-200 dark:border-warm-800">
                      <span className="text-xs font-bold text-warm-800 dark:text-warm-100">
                        {editingBlock ? 'Edit Block' : `Add Block to ${activeSet.name}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewBlock(false);
                          setEditingBlock(null);
                        }}
                        aria-label="Close"
                        className="text-warm-400 hover:text-warm-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Deep Learning Sprint"
                      className={inputCls}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-warm-500 mb-1">Start</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-warm-500 mb-1">End</label>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-warm-500 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className={`${inputCls} capitalize`}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="capitalize">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewBlock(false);
                          setEditingBlock(null);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-warm-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveBlock}
                        disabled={!name.trim()}
                        className="btn-pill flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-warm-200/70 dark:divide-warm-800 rounded-2xl border border-warm-200/70 dark:border-warm-800 overflow-hidden">
                  {activeSet.blocks.map((block) => (
                    <div key={block.id} className="flex items-center justify-between px-3 py-2.5 bg-white/60 dark:bg-warm-900/40">
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-warm-800 dark:text-warm-100 truncate">{block.name}</span>
                          <span className="text-[9px] uppercase font-bold text-warm-500 px-1.5 py-0.5 rounded-full bg-warm-100 dark:bg-warm-800">
                            {block.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {block.startTime} – {block.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditBlock(block)}
                          aria-label={`Edit ${block.name}`}
                          className="p-1.5 text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 rounded-full"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(block.id)}
                          aria-label={`Delete ${block.name}`}
                          className="p-1.5 text-warm-400 hover:text-rose-500 rounded-full"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className={sectionLabel}>Reminders</h2>
          <div className="card divide-y divide-warm-200/70 dark:divide-warm-800">
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-honey-100 text-honey-500 dark:bg-honey-500/15 dark:text-honey-300">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-warm-800 dark:text-warm-50">Routine Reminders</p>
                  <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
                    Notifications fire at block start with sound and snooze.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={appData.settings.notificationsEnabled}
                aria-label="Routine reminders"
                onClick={handleToggleNotifications}
                className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
                  appData.settings.notificationsEnabled ? 'bg-focus-600' : 'bg-warm-200 dark:bg-warm-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    appData.settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-warm-600 dark:text-warm-400">Preview reminder banner</span>
              <button
                type="button"
                onClick={() => {
                  if (activeSet && activeSet.blocks.length > 0) {
                    onTriggerTestNotification(activeSet.blocks[0]);
                    showStatus('Fired test reminder');
                  }
                }}
                className="text-xs font-bold text-focus-600 dark:text-focus-400"
              >
                Test reminder
              </button>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className={sectionLabel}>Appearance</h2>
          <div className="card p-3">
            <div className="seg">
              {themeOptions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdateAppData({ settings: { ...appData.settings, theme: id } })}
                  className={`seg-item flex items-center justify-center gap-1.5 ${appData.settings.theme === id ? 'seg-item-active' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Backup */}
        <section>
          <h2 className={sectionLabel}>Backup</h2>
          <div className="card p-4 space-y-3">
            <div>
              <p className="text-sm font-bold text-warm-800 dark:text-warm-50">Manual Safety Net</p>
              <p className="text-[11px] text-warm-500 dark:text-warm-400">
                Weekly auto-backup protects your data. Export your backup JSON anytime.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleExportJSON} className="btn-primary flex items-center justify-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Export Now</span>
              </button>
              <label className={`${softBtn} cursor-pointer`}>
                <Upload className="w-4 h-4 text-warm-600" />
                <span>Import Backup</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className={sectionLabel}>Danger zone</h2>
          <div className="card p-4 flex items-center justify-between gap-3 border-rose-200 dark:border-rose-900/50">
            <div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Reset All Data</span>
              </p>
              <p className="text-[11px] text-warm-500 dark:text-warm-400">Restore default blocks and clear local history</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
            >
              Reset
            </button>
          </div>
        </section>
      </div>
    </Page>
  );
};
