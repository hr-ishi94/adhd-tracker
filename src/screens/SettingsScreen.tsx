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

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-3.5 pt-2 pb-24 safe-top space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-0.5 px-0.5">
        <div>
          <h1 className="text-xl font-bold text-warm-900 dark:text-warm-100">
            Settings
          </h1>
          <p className="text-[11px] text-warm-500 dark:text-warm-400">
            Customize routines, reminders & roadmap
          </p>
        </div>
        <img 
          src="/logo.png" 
          alt="ADHD Tracker Logo" 
          className="w-8 h-8 rounded-lg object-contain shadow-soft border border-warm-200/60 dark:border-warm-800" 
        />
      </div>

      {statusMessage && (
        <div className="p-2.5 bg-focus-100 dark:bg-focus-950/60 border border-focus-200 dark:border-focus-800 text-focus-900 dark:text-focus-200 rounded-xl text-xs font-medium animate-in fade-in duration-200 text-center">
          {statusMessage}
        </div>
      )}

      {/* P1 #5: 2-Week Sprint Roadmap Link Card */}
      <div 
        onClick={onOpenRoadmap}
        className="cursor-pointer bg-white dark:bg-warm-850 rounded-xl p-3 border border-focus-300 dark:border-focus-700/60 shadow-soft hover:border-focus-500 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-300 group-hover:scale-105 transition-transform">
            <Milestone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <span>2-Week Sprint Roadmap</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-focus-100 dark:bg-focus-950 text-focus-800 dark:text-focus-300">
                Curriculum
              </span>
            </h2>
            <p className="text-[11px] text-warm-500 dark:text-warm-400">
              Track 7 sprints (Next.js, Django, DSA, System Design...)
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-focus-600 dark:text-focus-400 group-hover:translate-x-0.5 transition-transform">
          View →
        </span>
      </div>

      {/* P1 #3: Day-of-Week Routine Sets Manager */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-focus-600" />
              <span>Day-of-Week Routine Sets</span>
            </h2>
            <p className="text-[11px] text-warm-500 dark:text-warm-400">
              Different schedules for Weekdays vs. Saturday/Sunday
            </p>
          </div>

          <button
            onClick={() => setIsCreatingNewSet(true)}
            className="text-[11px] font-semibold text-focus-600 dark:text-focus-400 hover:underline flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            <span>New Set</span>
          </button>
        </div>

        {/* Create new set inline input */}
        {isCreatingNewSet && (
          <div className="p-2 rounded-lg bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-700 flex items-center gap-1.5">
            <input
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="e.g. Work From Home"
              autoFocus
              className="flex-1 bg-white dark:bg-warm-800 text-xs rounded px-2 py-1 border border-warm-300 dark:border-warm-700"
            />
            <button
              onClick={handleCreateSet}
              className="px-2.5 py-1 bg-focus-600 text-white rounded text-xs font-semibold"
            >
              Add
            </button>
            <button
              onClick={() => setIsCreatingNewSet(false)}
              className="p-1 text-warm-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Day of Week assignment matrix */}
        <div className="grid grid-cols-7 gap-1 text-center pt-1 border-t border-warm-100 dark:border-warm-800">
          {DAYS_OF_WEEK.map(({ day, label }) => {
            const assignedSetId = appData.routineSchedule?.[day];
            const assignedSet = appData.routineSets.find((s) => s.id === assignedSetId);
            const isToday = new Date().getDay() === day;

            return (
              <div key={day} className="flex flex-col items-center">
                <span className={`text-[10px] font-bold ${isToday ? 'text-focus-600' : 'text-warm-500'}`}>
                  {label}
                </span>
                <select
                  value={assignedSetId}
                  onChange={(e) => handleAssignDayToSet(day, e.target.value)}
                  className="w-full mt-0.5 text-[9px] font-medium bg-warm-50 dark:bg-warm-800 rounded px-0.5 py-1 border border-warm-200 dark:border-warm-700 text-center truncate"
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

        {/* Routine Set Tab Selector */}
        <div className="pt-2 border-t border-warm-100 dark:border-warm-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-warm-600 dark:text-warm-400">
              Edit Routine Blocks for:
            </span>
            {/* P1 #4: Copy routine forward button */}
            <button
              onClick={handleCopyRoutineForward}
              title="Apply this set's timings forward to all upcoming days using this set"
              className="text-[10px] text-focus-600 dark:text-focus-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Copy className="w-3 h-3" />
              <span>Copy forward</span>
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {appData.routineSets.map((set) => (
              <button
                key={set.id}
                onClick={() => setSelectedSetId(set.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSetId === set.id
                    ? 'bg-focus-600 text-white shadow-xs'
                    : 'bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 hover:bg-warm-200'
                }`}
              >
                {set.name} ({set.blocks.length})
              </button>
            ))}
          </div>
        </div>

        {/* Blocks inside activeSet */}
        {activeSet && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-warm-800 dark:text-warm-200">
                {activeSet.name} Schedule
              </span>
              {!isAddingNewBlock && !editingBlock && (
                <button
                  onClick={handleStartAddBlock}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-focus-600 text-white"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Block</span>
                </button>
              )}
            </div>

            {/* Inline Add / Edit Block Form */}
            {(isAddingNewBlock || editingBlock) && (
              <div className="p-3 rounded-lg bg-warm-50 dark:bg-warm-900 border border-focus-300 dark:border-focus-700 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-warm-200 dark:border-warm-800">
                  <span className="text-xs font-bold text-warm-900 dark:text-warm-100">
                    {editingBlock ? 'Edit Block' : `Add Block to ${activeSet.name}`}
                  </span>
                  <button
                    onClick={() => {
                      setIsAddingNewBlock(false);
                      setEditingBlock(null);
                    }}
                    className="text-warm-400 hover:text-warm-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Deep Learning Sprint"
                    className="w-full bg-white dark:bg-warm-800 text-xs rounded px-2.5 py-1.5 border border-warm-300 dark:border-warm-700 focus:outline-none focus:border-focus-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-warm-500 mb-0.5">Start:</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-white dark:bg-warm-800 text-xs rounded px-2 py-1 border border-warm-300 dark:border-warm-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-warm-500 mb-0.5">End:</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-white dark:bg-warm-800 text-xs rounded px-2 py-1 border border-warm-300 dark:border-warm-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-warm-500 mb-0.5">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-white dark:bg-warm-800 text-xs rounded px-2 py-1 border border-warm-300 dark:border-warm-700 capitalize"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewBlock(false);
                      setEditingBlock(null);
                    }}
                    className="px-2 py-1 text-xs text-warm-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBlock}
                    disabled={!name.trim()}
                    className="flex items-center gap-1 px-3 py-1 bg-focus-600 text-white rounded text-xs font-semibold"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            )}

            {/* Blocks List */}
            <div className="space-y-1.5">
              {activeSet.blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-warm-50 dark:bg-warm-900 border border-warm-200/60 dark:border-warm-800"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-warm-900 dark:text-warm-100 truncate">
                        {block.name}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-warm-400 px-1 py-0.2 rounded bg-warm-200/50 dark:bg-warm-800">
                        {block.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{block.startTime} – {block.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEditBlock(block)}
                      className="p-1.5 text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1.5 text-warm-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications & Reminders */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h2 className="text-xs font-bold text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-focus-600" />
              <span>Routine Reminders</span>
            </h2>
            <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
              Notifications fire at block start with sound and snooze.
            </p>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              appData.settings.notificationsEnabled
                ? 'bg-focus-600 text-white'
                : 'bg-warm-200 dark:bg-warm-800 text-warm-700 dark:text-warm-300'
            }`}
          >
            {appData.settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-warm-100 dark:border-warm-800 text-xs">
          <span className="text-warm-600 dark:text-warm-400 text-[11px]">
            Preview reminder banner:
          </span>
          <button
            onClick={() => {
              if (activeSet && activeSet.blocks.length > 0) {
                onTriggerTestNotification(activeSet.blocks[0]);
                showStatus('Fired test reminder');
              }
            }}
            className="text-xs font-medium text-focus-600 dark:text-focus-400 hover:underline"
          >
            Test reminder
          </button>
        </div>
      </div>

      {/* Appearance / Theme */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <h2 className="text-xs font-bold text-warm-900 dark:text-warm-100 mb-1.5">
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
          <button
            onClick={() => onUpdateAppData({ settings: { ...appData.settings, theme: 'system' } })}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all ${
              appData.settings.theme === 'system'
                ? 'bg-focus-50 border-focus-600 text-focus-800 dark:bg-focus-950/40 dark:border-focus-500 dark:text-focus-300 font-bold'
                : 'bg-warm-50 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-600 dark:text-warm-400'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>System</span>
          </button>

          <button
            onClick={() => onUpdateAppData({ settings: { ...appData.settings, theme: 'light' } })}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all ${
              appData.settings.theme === 'light'
                ? 'bg-focus-50 border-focus-600 text-focus-800 dark:bg-focus-950/40 dark:border-focus-500 dark:text-focus-300 font-bold'
                : 'bg-warm-50 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-600 dark:text-warm-400'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Light</span>
          </button>

          <button
            onClick={() => onUpdateAppData({ settings: { ...appData.settings, theme: 'dark' } })}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all ${
              appData.settings.theme === 'dark'
                ? 'bg-focus-50 border-focus-600 text-focus-800 dark:bg-focus-950/40 dark:border-focus-500 dark:text-focus-300 font-bold'
                : 'bg-warm-50 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-600 dark:text-warm-400'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Manual Safety Net: JSON Export / Import */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-warm-200/90 dark:border-warm-800 shadow-soft">
        <h2 className="text-xs font-bold text-warm-900 dark:text-warm-100 mb-0.5">
          Manual Safety Net (Export / Import)
        </h2>
        <p className="text-[11px] text-warm-500 dark:text-warm-400 mb-2">
          Weekly auto-backup protects your data. Export your backup JSON anytime.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-200 text-xs font-semibold transition-all"
          >
            <Download className="w-3 h-3 text-warm-600" />
            <span>Export Now</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-200 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-3 h-3 text-warm-600" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset Data */}
      <div className="bg-white dark:bg-warm-850 rounded-xl p-3 border border-red-200/60 dark:border-red-900/40 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </h2>
            <p className="text-[11px] text-warm-500 dark:text-warm-400">
              Restore default blocks and clear local history
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
