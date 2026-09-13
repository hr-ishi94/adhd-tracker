import React, { useState } from 'react';
import type { RoutineBlock, AppSettings, Category, AppData } from '../types';
import { notifications } from '../lib/notifications';
import { exportAppDataJSON, importAppDataJSON } from '../lib/storage';
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
  Laptop
} from 'lucide-react';

interface SettingsScreenProps {
  appData: AppData;
  onUpdateRoutineBlocks: (blocks: RoutineBlock[]) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onImportData: (importedData: AppData) => void;
  onResetAllData: () => void;
  onTriggerTestNotification: (block: RoutineBlock) => void;
}

const CATEGORIES: Category[] = ['learning', 'gym', 'office', 'project', 'review', 'sleep', 'personal'];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  appData,
  onUpdateRoutineBlocks,
  onUpdateSettings,
  onImportData,
  onResetAllData,
  onTriggerTestNotification,
}) => {
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<Category>('learning');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartAdd = () => {
    setName('');
    setStartTime('09:00');
    setEndTime('10:00');
    setCategory('learning');
    setIsAddingNew(true);
    setEditingBlock(null);
  };

  const handleStartEdit = (b: RoutineBlock) => {
    setName(b.name);
    setStartTime(b.startTime);
    setEndTime(b.endTime);
    setCategory(b.category);
    setEditingBlock(b);
    setIsAddingNew(false);
  };

  const handleSaveBlock = () => {
    if (!name.trim()) return;

    if (editingBlock) {
      // Update existing
      const updated = appData.routineBlocks.map((b) =>
        b.id === editingBlock.id
          ? { ...b, name: name.trim(), startTime, endTime, category }
          : b
      );
      onUpdateRoutineBlocks(updated);
      setEditingBlock(null);
      showStatus('Block updated');
    } else if (isAddingNew) {
      // Add new block
      const newBlock: RoutineBlock = {
        id: `block-${Date.now()}`,
        name: name.trim(),
        startTime,
        endTime,
        category,
      };
      onUpdateRoutineBlocks([...appData.routineBlocks, newBlock]);
      setIsAddingNew(false);
      showStatus('New block added');
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (appData.routineBlocks.length <= 1) {
      alert('You need at least one routine block.');
      return;
    }
    const updated = appData.routineBlocks.filter((b) => b.id !== id);
    onUpdateRoutineBlocks(updated);
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
        onUpdateSettings({ notificationsEnabled: true });
        showStatus('Notifications enabled');
      } else {
        alert('Notification permission was not granted. Please check your browser or phone site settings.');
      }
    } else {
      onUpdateSettings({ notificationsEnabled: false });
      showStatus('Notifications disabled');
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportAppDataJSON(appData);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `daily-focus-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        onImportData(res.data);
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
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-28 safe-top">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-100">
            Settings
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400">
            Customize your routine, reminders & manual safety net
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-focus-100 dark:bg-focus-950/60 border border-focus-200 dark:border-focus-800 text-focus-900 dark:text-focus-200 rounded-xl text-xs font-medium animate-in fade-in duration-200 text-center">
          {statusMessage}
        </div>
      )}

      {/* Routine Blocks Manager */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-warm-900 dark:text-warm-100">
              Routine Blocks
            </h2>
            <p className="text-xs text-warm-500 dark:text-warm-400">
              Adjust times or names freely as your schedule shifts
            </p>
          </div>
          {!isAddingNew && !editingBlock && (
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-focus-600 hover:bg-focus-700 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form Modal or Inline Card */}
        {(isAddingNew || editingBlock) && (
          <div className="mb-4 p-4 rounded-xl bg-warm-50 dark:bg-warm-900 border border-focus-300 dark:border-focus-700 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-warm-200 dark:border-warm-800">
              <span className="text-xs font-bold text-warm-900 dark:text-warm-100">
                {editingBlock ? 'Edit Block' : 'Add Routine Block'}
              </span>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingBlock(null);
                }}
                className="text-warm-400 hover:text-warm-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-600 dark:text-warm-400 mb-1">
                Block Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. System Design Prep"
                className="w-full bg-white dark:bg-warm-800 text-sm rounded-lg px-3 py-2 border border-warm-300 dark:border-warm-700 focus:outline-none focus:border-focus-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-warm-600 dark:text-warm-400 mb-1">
                  Start Time:
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white dark:bg-warm-800 text-sm rounded-lg px-2.5 py-2 border border-warm-300 dark:border-warm-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-600 dark:text-warm-400 mb-1">
                  End Time:
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white dark:bg-warm-800 text-sm rounded-lg px-2.5 py-2 border border-warm-300 dark:border-warm-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-warm-600 dark:text-warm-400 mb-1">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-white dark:bg-warm-800 text-sm rounded-lg px-3 py-2 border border-warm-300 dark:border-warm-700 capitalize"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingBlock(null);
                }}
                className="px-3 py-1.5 text-xs text-warm-600 dark:text-warm-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBlock}
                disabled={!name.trim()}
                className="flex items-center gap-1 px-4 py-1.5 bg-focus-600 text-white rounded-lg text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing routine blocks list */}
        <div className="space-y-2">
          {appData.routineBlocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between p-3 rounded-xl bg-warm-50 dark:bg-warm-900 border border-warm-200/60 dark:border-warm-800"
            >
              <div className="truncate pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-warm-900 dark:text-warm-100 truncate">
                    {block.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-warm-400 px-1.5 py-0.5 rounded bg-warm-200/50 dark:bg-warm-800">
                    {block.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{block.startTime} – {block.endTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleStartEdit(block)}
                  className="p-2 text-warm-500 hover:text-warm-800 dark:hover:text-warm-200 rounded-lg"
                  aria-label={`Edit ${block.name}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="p-2 text-warm-400 hover:text-red-500 rounded-lg"
                  aria-label={`Delete ${block.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications & Reminders (SPEC §4.4, §9) */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h2 className="text-sm font-bold text-warm-900 dark:text-warm-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-focus-600" />
              <span>Routine Reminders</span>
            </h2>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Client-side notifications fire when each block begins (with sound & snooze).
            </p>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              appData.settings.notificationsEnabled
                ? 'bg-focus-600 text-white'
                : 'bg-warm-200 dark:bg-warm-800 text-warm-700 dark:text-warm-300'
            }`}
          >
            {appData.settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-warm-100 dark:border-warm-800">
          <span className="text-xs text-warm-600 dark:text-warm-400">
            Preview reminder banner & tone:
          </span>
          <button
            onClick={() => {
              if (appData.routineBlocks.length > 0) {
                onTriggerTestNotification(appData.routineBlocks[0]);
                showStatus('Fired test reminder');
              }
            }}
            className="text-xs font-medium text-focus-600 dark:text-focus-400 hover:underline"
          >
            Test notification
          </button>
        </div>
      </div>

      {/* Appearance / Theme */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft mb-5">
        <h2 className="text-sm font-bold text-warm-900 dark:text-warm-100 mb-2">
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-2 text-xs font-medium">
          <button
            onClick={() => onUpdateSettings({ theme: 'system' })}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all ${
              appData.settings.theme === 'system'
                ? 'bg-focus-50 border-focus-600 text-focus-800 dark:bg-focus-950/40 dark:border-focus-500 dark:text-focus-300 font-bold'
                : 'bg-warm-50 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-600 dark:text-warm-400'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>System</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'light' })}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all ${
              appData.settings.theme === 'light'
                ? 'bg-focus-50 border-focus-600 text-focus-800 dark:bg-focus-950/40 dark:border-focus-500 dark:text-focus-300 font-bold'
                : 'bg-warm-50 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-600 dark:text-warm-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Warm Light</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all ${
              appData.settings.theme === 'dark'
                ? 'bg-focus-50 border-focus-600 text-focus-800 dark:bg-focus-950/40 dark:border-focus-500 dark:text-focus-300 font-bold'
                : 'bg-warm-50 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-600 dark:text-warm-400'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Calm Dark</span>
          </button>
        </div>
      </div>

      {/* Manual Safety Net: JSON Export / Import (SPEC §4.9) */}
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-warm-200/90 dark:border-warm-800 shadow-soft mb-5">
        <h2 className="text-sm font-bold text-warm-900 dark:text-warm-100 mb-1">
          Manual Safety Net (Export / Import)
        </h2>
        <p className="text-xs text-warm-500 dark:text-warm-400 mb-3">
          Since all data stays purely on this device, export your backup JSON anytime.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-200 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-warm-600" />
            <span>Export Backup</span>
          </button>

          <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-200 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-warm-600" />
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
      <div className="bg-white dark:bg-warm-850 rounded-2xl p-4 border border-red-200/60 dark:border-red-900/40 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Reset All Data</span>
            </h2>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
              Restore default blocks and clear local history
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
