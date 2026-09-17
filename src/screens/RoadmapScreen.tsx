import React, { useState } from 'react';
import type { Sprint, LearningTopic } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoadmapScreenProps {
  sprints: Sprint[];
  onUpdateSprints: (sprints: Sprint[]) => void;
  onStartPomodoroForSprint?: (sprintName: string) => void;
}

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({
  sprints,
  onUpdateSprints,
  onStartPomodoroForSprint,
}) => {
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(
    sprints.find((s) => s.status === 'active')?.id || sprints[0]?.id || null
  );
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  // New Sprint Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Frontend & Fullstack');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState(2);
  const [newTopicText, setNewTopicText] = useState('');

  // Add sub-topic input per sprint
  const [subTopicInputs, setSubTopicInputs] = useState<Record<string, string>>({});

  // Calculations for overall learning curve
  const allTopics = sprints.flatMap((s) => s.topics || []);
  const completedTopicsCount = allTopics.filter((t) => t.completed).length;
  const totalTopicsCount = allTopics.length;
  const overallCurveProgress = totalTopicsCount > 0 
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100) 
    : 0;

  const calculateDaysRemaining = (startDateStr: string | null, weeks: number): { daysRemaining: number; totalDays: number } => {
    const totalDays = weeks * 7;
    if (!startDateStr) return { daysRemaining: totalDays, totalDays };
    const start = new Date(startDateStr);
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - elapsedDays);
    return { daysRemaining, totalDays };
  };

  const handleToggleTopic = (sprintId: string, topicId: string) => {
    const updated = sprints.map((s) => {
      if (s.id !== sprintId) return s;
      const topics = (s.topics || []).map((t) =>
        t.id === topicId ? { ...t, completed: !t.completed } : t
      );
      return { ...s, topics };
    });
    onUpdateSprints(updated);
  };

  const handleAddTopic = (sprintId: string) => {
    const text = (subTopicInputs[sprintId] || '').trim();
    if (!text) return;

    const newTopic: LearningTopic = {
      id: `topic-${Date.now()}`,
      title: text,
      completed: false,
    };

    const updated = sprints.map((s) => {
      if (s.id !== sprintId) return s;
      return {
        ...s,
        topics: [...(s.topics || []), newTopic],
      };
    });

    onUpdateSprints(updated);
    setSubTopicInputs({ ...subTopicInputs, [sprintId]: '' });
  };

  const handleDeleteTopic = (sprintId: string, topicId: string) => {
    const updated = sprints.map((s) => {
      if (s.id !== sprintId) return s;
      return {
        ...s,
        topics: (s.topics || []).filter((t) => t.id !== topicId),
      };
    });
    onUpdateSprints(updated);
  };

  const handleCompleteSprint = (sprintId: string) => {
    const index = sprints.findIndex((s) => s.id === sprintId);
    if (index === -1) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const updated = sprints.map((s, i) => {
      if (i === index) {
        return { ...s, status: 'done' as const };
      }
      if (i === index + 1 && s.status === 'upcoming') {
        return { ...s, status: 'active' as const, startDate: todayStr };
      }
      return s;
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f26543', '#549646', '#ffd700'],
      });
    } catch {
      // fallback
    }

    onUpdateSprints(updated);
  };

  const handleDeleteSprint = (sprintId: string) => {
    if (sprints.length <= 1) return;
    const updated = sprints.filter((s) => s.id !== sprintId);
    onUpdateSprints(updated);
  };

  const handleCreateSprint = () => {
    if (!newTitle.trim()) return;

    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name: newTitle.trim(),
      category: newCategory.trim() || 'Curriculum',
      description: newDescription.trim(),
      durationWeeks: newDuration || 2,
      startDate: sprints.length === 0 ? new Date().toISOString().slice(0, 10) : null,
      status: sprints.length === 0 ? 'active' : 'upcoming',
      topics: newTopicText
        ? newTopicText.split('\n').filter(Boolean).map((t, idx) => ({
            id: `top-${Date.now()}-${idx}`,
            title: t.trim(),
            completed: false,
          }))
        : [],
    };

    onUpdateSprints([...sprints, newSprint]);
    setNewTitle('');
    setNewDescription('');
    setNewTopicText('');
    setIsAddingSprint(false);
  };

  const handleSaveEditSprint = () => {
    if (!editingSprint) return;
    const updated = sprints.map((s) => (s.id === editingSprint.id ? editingSprint : s));
    onUpdateSprints(updated);
    setEditingSprint(null);
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-focus-100 dark:bg-focus-950/60 text-focus-700 dark:text-focus-300 text-xs font-bold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-focus-600" />
            <span>Dynamic Learning Curve</span>
          </div>
          <h1 className="text-2xl font-black text-warm-900 dark:text-warm-100 tracking-tight">
            Curriculum & Sprints
          </h1>
        </div>

        <button
          onClick={() => setIsAddingSprint(true)}
          className="py-2 px-3 rounded-2xl bg-focus-600 hover:bg-focus-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Sprint</span>
        </button>
      </div>

      {/* Visual Learning Curve Progress Card */}
      <div className="bg-gradient-to-br from-white to-warm-50 dark:from-warm-850 dark:to-warm-900 rounded-3xl p-5 border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-focus-100 dark:bg-focus-950/60 text-focus-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-warm-900 dark:text-warm-100">
                Mastery Curve: {overallCurveProgress}%
              </h2>
              <p className="text-xs text-warm-500">
                {completedTopicsCount} of {totalTopicsCount} skills checked off
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-mono font-bold text-focus-600">
            {sprints.filter(s => s.status === 'done').length} / {sprints.length} Sprints Done
          </span>
        </div>

        {/* Progress Arc/Bar */}
        <div className="w-full h-3 bg-warm-200/80 dark:bg-warm-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-focus-500 to-leaf-500 rounded-full transition-all duration-700"
            style={{ width: `${overallCurveProgress}%` }}
          />
        </div>
      </div>

      {/* Sprints List */}
      <div className="space-y-3.5">
        {sprints.map((sprint, index) => {
          const isActive = sprint.status === 'active';
          const isDone = sprint.status === 'done';
          const isExpanded = expandedSprintId === sprint.id;
          const { daysRemaining, totalDays } = calculateDaysRemaining(sprint.startDate, sprint.durationWeeks);
          const topics = sprint.topics || [];
          const topicsDone = topics.filter((t) => t.completed).length;
          const sprintPercent = topics.length > 0 ? Math.round((topicsDone / topics.length) * 100) : (isDone ? 100 : 0);

          return (
            <div
              key={sprint.id}
              className={`rounded-3xl border transition-all overflow-hidden ${
                isActive
                  ? 'bg-white dark:bg-warm-850 border-focus-400 dark:border-focus-600 shadow-lifted'
                  : isDone
                  ? 'bg-warm-50/80 dark:bg-warm-900/40 border-warm-200/80 dark:border-warm-800'
                  : 'bg-white dark:bg-warm-850 border-warm-200/90 dark:border-warm-800 shadow-soft'
              }`}
            >
              {/* Sprint Header Row */}
              <div className="p-4 sm:p-5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div 
                    onClick={() => setExpandedSprintId(isExpanded ? null : sprint.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono uppercase font-bold text-warm-500">
                        Sprint {index + 1} • {sprint.durationWeeks} Weeks
                      </span>
                      {sprint.category && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300">
                          {sprint.category}
                        </span>
                      )}
                      {isActive && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-focus-100 dark:bg-focus-950 text-focus-700 dark:text-focus-300 animate-pulse">
                          🟢 Current Focus
                        </span>
                      )}
                      {isDone && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-leaf-100 dark:bg-leaf-950 text-leaf-700 dark:text-leaf-300">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100 mt-1.5">
                      {sprint.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingSprint(sprint)}
                      className="p-2 rounded-xl text-warm-400 hover:text-warm-700 dark:hover:text-warm-200"
                      title="Edit sprint details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedSprintId(isExpanded ? null : sprint.id)}
                      className="p-2 rounded-xl text-warm-400 hover:text-warm-700 dark:hover:text-warm-200"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {sprint.description && (
                  <p className="text-xs sm:text-sm text-warm-600 dark:text-warm-400 leading-relaxed">
                    {sprint.description}
                  </p>
                )}

                {/* Progress bar and metrics */}
                <div className="flex items-center justify-between pt-1 text-xs sm:text-sm text-warm-500 font-semibold">
                  <span>{topicsDone}/{topics.length} skills mastered ({sprintPercent}%)</span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-focus-600 font-bold">
                      <Clock className="w-4 h-4" />
                      <span>{daysRemaining} of {totalDays} days left</span>
                    </span>
                  )}
                </div>

                <div className="w-full h-2 bg-warm-200/60 dark:bg-warm-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? 'bg-leaf-500' : 'bg-focus-500'
                    }`}
                    style={{ width: `${sprintPercent}%` }}
                  />
                </div>
              </div>

              {/* Expanded Sub-Topics Checklist & Actions */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-warm-200/60 dark:border-warm-800 bg-warm-50/50 dark:bg-warm-900/30 space-y-3.5">
                  {/* Action row: Study in Pomodoro & Complete Sprint */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
                    {onStartPomodoroForSprint && (
                      <button
                        onClick={() => onStartPomodoroForSprint(sprint.name)}
                        className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl bg-focus-100 hover:bg-focus-200 dark:bg-focus-950 dark:hover:bg-focus-900 text-focus-700 dark:text-focus-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Study in Pomodoro (25m)</span>
                      </button>
                    )}

                    {!isDone ? (
                      <button
                        onClick={() => handleCompleteSprint(sprint.id)}
                        className="min-h-[44px] py-2.5 px-4 rounded-2xl bg-leaf-600 hover:bg-leaf-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Complete</span>
                      </button>
                    ) : (
                      <span className="text-xs sm:text-sm font-bold text-leaf-600 flex items-center gap-1.5 px-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sprint Done</span>
                      </span>
                    )}
                  </div>

                  {/* Sub-Topics Checklist */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-warm-500 block">
                      Checklist / Skills to Learn
                    </label>

                    {topics.length === 0 ? (
                      <p className="text-xs sm:text-sm italic text-warm-400 py-1">
                        No sub-topics added yet. Add one below!
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {topics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-warm-850 border border-warm-200/80 dark:border-warm-800 gap-2"
                          >
                            <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={topic.completed}
                                onChange={() => handleToggleTopic(sprint.id, topic.id)}
                                className="w-5 h-5 rounded-md text-focus-600 focus:ring-focus-500 cursor-pointer"
                              />
                              <span
                                className={`text-sm sm:text-base leading-snug truncate ${
                                  topic.completed
                                    ? 'line-through text-warm-400 dark:text-warm-500 font-normal'
                                    : 'text-warm-800 dark:text-warm-100 font-semibold'
                                }`}
                              >
                                {topic.title}
                              </span>
                            </label>
                            <button
                              onClick={() => handleDeleteTopic(sprint.id, topic.id)}
                              className="p-1.5 text-warm-300 hover:text-red-500 rounded"
                              title="Delete subtopic"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add topic input */}
                    <div className="flex gap-2 pt-1.5">
                      <input
                        type="text"
                        placeholder="Add skill/concept (e.g. Next.js Auth)..."
                        value={subTopicInputs[sprint.id] || ''}
                        onChange={(e) =>
                          setSubTopicInputs({ ...subTopicInputs, [sprint.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTopic(sprint.id);
                        }}
                        className="flex-1 text-xs sm:text-sm p-3 rounded-2xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-850 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                      />
                      <button
                        onClick={() => handleAddTopic(sprint.id)}
                        className="px-4 py-3 bg-warm-200 hover:bg-warm-300 dark:bg-warm-800 dark:hover:bg-warm-700 text-warm-800 dark:text-warm-200 rounded-2xl text-xs sm:text-sm font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Delete Sprint button */}
                  {sprints.length > 1 && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDeleteSprint(sprint.id)}
                        className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete this sprint</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Sprint Modal */}
      {isAddingSprint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-warm-850 rounded-3xl max-w-sm w-full p-5 border border-warm-200 dark:border-warm-800 shadow-lifted space-y-3">
            <h3 className="text-sm font-bold text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-focus-600" />
              <span>Create New Learning Sprint</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Sprint Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js 15 & Microservices"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Category / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fullstack, Algorithms, DevOps"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Duration (Weeks)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Initial Sub-Topics (1 per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="App Router deep dive&#10;Server Components&#10;Prisma DB setup"
                  value={newTopicText}
                  onChange={(e) => setNewTopicText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsAddingSprint(false)}
                className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSprint}
                className="flex-1 py-2.5 rounded-xl bg-focus-600 text-white text-xs font-bold hover:bg-focus-700"
              >
                Create Sprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sprint Modal */}
      {editingSprint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-warm-850 rounded-3xl max-w-sm w-full p-5 border border-warm-200 dark:border-warm-800 shadow-lifted space-y-3">
            <h3 className="text-sm font-bold text-warm-900 dark:text-warm-100">
              Edit Sprint
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingSprint.name}
                  onChange={(e) => setEditingSprint({ ...editingSprint, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100"
                />
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingSprint.category || ''}
                  onChange={(e) => setEditingSprint({ ...editingSprint, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100"
                />
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingSprint.description || ''}
                  onChange={(e) => setEditingSprint({ ...editingSprint, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-800 bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingSprint(null)}
                className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditSprint}
                className="flex-1 py-2.5 rounded-xl bg-focus-600 text-white text-xs font-bold hover:bg-focus-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
