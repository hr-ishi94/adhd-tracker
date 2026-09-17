import React, { useState } from 'react';
import type { DreamAssessment, WeeklyPlan, LearningTopic } from '../types';
import { 
  Target, 
  Sparkles, 
  Plus, 
  Check, 
  Flame, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoadmapScreenProps {
  dreamAssessment?: DreamAssessment | null;
  onUpdateDreamAssessment: (assessment: DreamAssessment | null) => void;
  onStartPomodoro?: () => void;
}

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({
  dreamAssessment,
  onUpdateDreamAssessment,
  onStartPomodoro,
}) => {
  const [isTakingAssessment, setIsTakingAssessment] = useState(!dreamAssessment);

  // Assessment Wizard Form State
  const [dreamTitle, setDreamTitle] = useState(dreamAssessment?.dreamTitle || '');
  const [researchStatus, setResearchStatus] = useState<'researched' | 'in_progress' | 'starting'>(
    dreamAssessment?.researchStatus || 'in_progress'
  );
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(
    dreamAssessment?.weeklyPlans?.map(w => w.skillTitle) || [
      'Core Fundamentals & Architecture',
      'Hands-on Project Building',
      'Advanced Problem Solving & Patterns',
      'Production Deployment & Polish'
    ]
  );
  const [targetWeeks, setTargetWeeks] = useState<number>(dreamAssessment?.targetWeeks || 8);
  const [startDateChoice, setStartDateChoice] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [motivation, setMotivation] = useState(
    dreamAssessment?.motivation || 'To master this craft, build meaningful projects, and create financial freedom.'
  );

  // Manual topic addition state per week
  const [topicInputs, setTopicInputs] = useState<Record<string, string>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({ 'week-1': true });

  // Popular inspirations for dream title
  const inspirations = [
    'Full-Stack Developer',
    'Mobile App Creator',
    'AI / Machine Learning Engineer',
    'UI/UX Product Designer',
    '3D Game Artist',
    'Creative Novelist / Writer',
  ];

  const handleAddSkillToAssessment = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkillFromAssessment = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const handleCompleteAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamTitle.trim()) return;

    const chosenSkills = skillsList.length > 0 
      ? skillsList 
      : ['Foundation & Setup', 'Hands-on Building', 'Polish & Delivery'];

    // Distribute skills across targetWeeks
    const weeklyPlans: WeeklyPlan[] = [];
    for (let w = 1; w <= targetWeeks; w++) {
      const skillIndex = (w - 1) % chosenSkills.length;
      const skillName = chosenSkills[skillIndex];
      const weekTitle = targetWeeks > chosenSkills.length 
        ? `${skillName} (Part ${Math.floor((w - 1) / chosenSkills.length) + 1})`
        : skillName;

      weeklyPlans.push({
        id: `week-${w}`,
        weekNumber: w,
        skillTitle: weekTitle,
        topics: [
          { id: `topic-${w}-1`, title: `Learn core concepts of ${skillName}`, completed: false },
          { id: `topic-${w}-2`, title: `Build one real practice exercise`, completed: false },
        ],
      });
    }

    const calculatedStartDate = startDateChoice === 'today'
      ? new Date().toISOString()
      : startDateChoice === 'next-monday'
        ? getNextMondayISO()
        : new Date(customStartDate).toISOString();

    const newAssessment: DreamAssessment = {
      id: `dream-${Date.now()}`,
      dreamTitle: dreamTitle.trim(),
      researchStatus,
      targetWeeks,
      startDate: calculatedStartDate,
      motivation: motivation.trim(),
      weeklyPlans,
    };

    onUpdateDreamAssessment(newAssessment);
    setIsTakingAssessment(false);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f26543', '#549646', '#ffd700'],
      });
    } catch {
      // fallback
    }
  };

  function getNextMondayISO() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + ((7 - day + 1) % 7 || 7);
    d.setDate(diff);
    return d.toISOString();
  }

  // Check off or toggle topic
  const handleToggleTopic = (weekId: string, topicId: string) => {
    if (!dreamAssessment) return;
    const updatedWeeklyPlans = dreamAssessment.weeklyPlans.map((w) => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        topics: w.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t)),
      };
    });

    onUpdateDreamAssessment({
      ...dreamAssessment,
      weeklyPlans: updatedWeeklyPlans,
    });
  };

  // Add custom topic manually to a specific week
  const handleAddTopic = (weekId: string) => {
    if (!dreamAssessment) return;
    const text = (topicInputs[weekId] || '').trim();
    if (!text) return;

    const newTopic: LearningTopic = {
      id: `t-${Date.now()}`,
      title: text,
      completed: false,
    };

    const updatedWeeklyPlans = dreamAssessment.weeklyPlans.map((w) => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        topics: [...w.topics, newTopic],
      };
    });

    onUpdateDreamAssessment({
      ...dreamAssessment,
      weeklyPlans: updatedWeeklyPlans,
    });

    setTopicInputs({ ...topicInputs, [weekId]: '' });
  };

  // Delete topic
  const handleDeleteTopic = (weekId: string, topicId: string) => {
    if (!dreamAssessment) return;
    const updatedWeeklyPlans = dreamAssessment.weeklyPlans.map((w) => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        topics: w.topics.filter((t) => t.id !== topicId),
      };
    });

    onUpdateDreamAssessment({
      ...dreamAssessment,
      weeklyPlans: updatedWeeklyPlans,
    });
  };

  // Add next week
  const handleAddNextWeek = () => {
    if (!dreamAssessment) return;
    const nextWeekNum = dreamAssessment.weeklyPlans.length + 1;
    const newWeek: WeeklyPlan = {
      id: `week-${nextWeekNum}`,
      weekNumber: nextWeekNum,
      skillTitle: `Week ${nextWeekNum}: Advanced Practice & Integration`,
      topics: [
        { id: `t-${nextWeekNum}-1`, title: 'Synthesize knowledge and review progress', completed: false },
      ],
    };

    onUpdateDreamAssessment({
      ...dreamAssessment,
      targetWeeks: nextWeekNum,
      weeklyPlans: [...dreamAssessment.weeklyPlans, newWeek],
    });
    setExpandedWeeks({ ...expandedWeeks, [newWeek.id]: true });
  };

  // Calculations for progress
  const allTopics = dreamAssessment?.weeklyPlans.flatMap((w) => w.topics) || [];
  const completedTopics = allTopics.filter((t) => t.completed).length;
  const totalTopics = allTopics.length;
  const masteryPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // -------------------------------------------------------------
  // VIEW 1: MOTIVATIONAL ASSESSMENT QUESTIONNAIRE
  // -------------------------------------------------------------
  if (isTakingAssessment) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-300 text-xs font-bold">
            <Target className="w-3.5 h-3.5 text-focus-600" />
            <span>ADHD Goal Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 tracking-tight">
            Build Your Dream Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-warm-500 dark:text-warm-400">
            A simple 6-step compass to transform your big ambition into calm weekly steps.
          </p>
        </div>

        <form onSubmit={handleCompleteAssessment} className="space-y-4">
          {/* Question 1: What is your dream? */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
            <label className="block text-sm font-black text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-focus-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>What is your dream or target?</span>
            </label>
            <input
              type="text"
              required
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              placeholder="e.g. Full-Stack Web Developer, 3D Animator..."
              className="w-full text-base font-semibold bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-3 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
            />
            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {inspirations.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDreamTitle(item)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-focus-100 hover:text-focus-800 transition-colors"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Have you researched how to achieve this? */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
            <label className="block text-sm font-black text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-focus-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Have you researched how to achieve this?</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'researched', label: '🚀 Yes, I have a clear roadmap and steps' },
                { value: 'in_progress', label: '🗺️ Somewhat, I know the main milestones' },
                { value: 'starting', label: '🧭 Just starting out, ready to learn step-by-step' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setResearchStatus(opt.value as any)}
                  className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                    researchStatus === opt.value
                      ? 'border-focus-500 bg-focus-50/70 dark:bg-focus-950/40 text-focus-900 dark:text-focus-200'
                      : 'border-warm-200 dark:border-warm-800 text-warm-700 dark:text-warm-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {researchStatus === opt.value && <Check className="w-4 h-4 text-focus-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Core skills to learn */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
            <label className="block text-sm font-black text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-focus-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>What core skills shall you learn?</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkillToAssessment();
                  }
                }}
                placeholder="Type a skill and tap Add..."
                className="flex-1 text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-2 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
              />
              <button
                type="button"
                onClick={handleAddSkillToAssessment}
                className="px-3.5 py-2 bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 text-warm-800 dark:text-warm-200 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            {/* List of skills */}
            <div className="space-y-1.5 pt-1">
              {skillsList.map((sk, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 bg-warm-50 dark:bg-warm-900 rounded-xl text-xs font-medium text-warm-800 dark:text-warm-200"
                >
                  <span><strong>Week {idx + 1}:</strong> {sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillFromAssessment(idx)}
                    className="text-warm-400 hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Question 4: How many weeks? */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
            <label className="block text-sm font-black text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-focus-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>How many weeks will you commit?</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetWeeks(num)}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    targetWeeks === num
                      ? 'border-focus-500 bg-focus-600 text-white shadow-xs'
                      : 'border-warm-200 dark:border-warm-800 text-warm-700 dark:text-warm-300'
                  }`}
                >
                  {num} Weeks
                </button>
              ))}
            </div>
          </div>

          {/* Question 5: When do you wish to start? */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
            <label className="block text-sm font-black text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-focus-600 text-white text-xs flex items-center justify-center font-bold">5</span>
              <span>When do you wish to start?</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'today', label: 'Today (Now)' },
                { value: 'next-monday', label: 'Next Monday' },
                { value: 'custom', label: 'Custom Date' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStartDateChoice(opt.value)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    startDateChoice === opt.value
                      ? 'border-focus-500 bg-focus-600 text-white shadow-xs'
                      : 'border-warm-200 dark:border-warm-800 text-warm-700 dark:text-warm-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {startDateChoice === 'custom' && (
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3 py-2 text-warm-800 dark:text-warm-200 focus:outline-none"
              />
            )}
          </div>

          {/* Question 6: Your "Why" / Motivation */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-2xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2.5">
            <label className="block text-sm font-black text-warm-900 dark:text-warm-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-focus-600 text-white text-xs flex items-center justify-center font-bold">6</span>
              <span>What is your personal 'Why' / Motivation?</span>
            </label>
            <textarea
              rows={2}
              required
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Remind yourself on low-dopamine days why this matters..."
              className="w-full text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-2.5 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {dreamAssessment && (
              <button
                type="button"
                onClick={() => setIsTakingAssessment(false)}
                className="flex-1 py-3.5 rounded-2xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-bold text-sm"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl bg-focus-600 hover:bg-focus-700 text-white font-black text-base shadow-lifted active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create My Dream Roadmap</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: MOTIVATIONAL WEEKLY ROADMAP & TOPIC CHECKLISTS
  // -------------------------------------------------------------
  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-4">
      {/* Motivational Hero Card */}
      <div className="bg-gradient-to-br from-focus-50 via-warm-50 to-leaf-50 dark:from-warm-850 dark:to-warm-900 rounded-3xl p-5 border border-focus-200/80 dark:border-focus-800/60 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-focus-100 dark:bg-focus-950/80 text-focus-800 dark:text-focus-300 text-xs font-black uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-focus-600" />
            <span>My Life Dream Target</span>
          </div>

          <button
            onClick={() => setIsTakingAssessment(true)}
            className="text-xs font-bold text-focus-700 dark:text-focus-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Edit Target</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 tracking-tight leading-tight">
            {dreamAssessment?.dreamTitle}
          </h1>
          {dreamAssessment?.motivation && (
            <p className="text-xs sm:text-sm text-warm-600 dark:text-warm-300 italic mt-1.5 border-l-2 border-focus-400 pl-2.5">
              "{dreamAssessment.motivation}"
            </p>
          )}
        </div>

        {/* Progress Bar & Mastery Percentage */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-warm-600 dark:text-warm-300">
              Total Mastery: <strong className="text-focus-600 dark:text-focus-400 font-black">{masteryPercentage}%</strong>
            </span>
            <span className="text-warm-500 font-medium">
              {completedTopics} / {totalTopics} skills mastered
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-warm-200 dark:bg-warm-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-focus-500 to-leaf-500 transition-all duration-500"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Launch Pomodoro */}
        {onStartPomodoro && (
          <button
            onClick={onStartPomodoro}
            className="w-full py-3 rounded-2xl bg-white dark:bg-warm-800 border border-focus-200 dark:border-focus-800 text-focus-700 dark:text-focus-300 font-bold text-xs sm:text-sm shadow-xs hover:border-focus-400 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Flame className="w-4 h-4 text-focus-600" />
            <span>Start 25m Pomodoro Study Sprint →</span>
          </button>
        )}
      </div>

      {/* Week-by-Week Skill Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-warm-900 dark:text-warm-100 uppercase tracking-wider">
            Weekly Skill Progression
          </h2>
          <span className="text-xs font-bold text-warm-500">
            {dreamAssessment?.weeklyPlans.length} Weeks Planned
          </span>
        </div>

        {dreamAssessment?.weeklyPlans.map((week) => {
          const isExpanded = expandedWeeks[week.id] ?? true;
          const weekDone = week.topics.length > 0 && week.topics.every(t => t.completed);

          return (
            <div 
              key={week.id}
              className={`bg-white dark:bg-warm-850 rounded-2xl border transition-all overflow-hidden ${
                weekDone 
                  ? 'border-leaf-300 dark:border-leaf-800 shadow-xs' 
                  : 'border-warm-200/90 dark:border-warm-800 shadow-soft'
              }`}
            >
              {/* Card Header */}
              <div 
                onClick={() => setExpandedWeeks({ ...expandedWeeks, [week.id]: !isExpanded })}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-warm-50/60 dark:hover:bg-warm-800/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    weekDone 
                      ? 'bg-leaf-100 text-leaf-700 dark:bg-leaf-950 dark:text-leaf-300' 
                      : 'bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300'
                  }`}>
                    {weekDone ? <Check className="w-4 h-4 stroke-[3]" /> : `W${week.weekNumber}`}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-warm-900 dark:text-warm-100 truncate">
                      {week.skillTitle}
                    </h3>
                    <p className="text-[11px] text-warm-500 font-medium">
                      {week.topics.filter(t => t.completed).length} of {week.topics.length} items checked
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-warm-400" /> : <ChevronDown className="w-4 h-4 text-warm-400" />}
                </div>
              </div>

              {/* Topics List & Add Topic Input */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-warm-100 dark:divide-warm-800">
                  {/* Topic Items */}
                  <div className="space-y-1.5 pt-1">
                    {week.topics.map((topic) => (
                      <div 
                        key={topic.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-warm-50/80 dark:bg-warm-900/60 hover:bg-warm-100/60 transition-colors gap-2"
                      >
                        <label className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={topic.completed}
                            onChange={() => handleToggleTopic(week.id, topic.id)}
                            className="w-5 h-5 rounded-md text-focus-600 focus:ring-focus-500 border-warm-300 dark:border-warm-700"
                          />
                          <span className={`text-xs sm:text-sm font-medium leading-tight ${
                            topic.completed 
                              ? 'line-through text-warm-400 dark:text-warm-500' 
                              : 'text-warm-800 dark:text-warm-200'
                          }`}>
                            {topic.title}
                          </span>
                        </label>
                        <button
                          onClick={() => handleDeleteTopic(week.id, topic.id)}
                          className="text-warm-400 hover:text-red-500 p-1 shrink-0"
                          title="Delete topic"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Quick Add Topic Input */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Add sub-topic or milestone..."
                      value={topicInputs[week.id] || ''}
                      onChange={(e) => setTopicInputs({ ...topicInputs, [week.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTopic(week.id);
                        }
                      }}
                      className="flex-1 text-xs bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3 py-2 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                    />
                    <button
                      onClick={() => handleAddTopic(week.id)}
                      className="px-3 py-2 bg-warm-100 hover:bg-warm-200 dark:bg-warm-800 text-warm-700 dark:text-warm-300 rounded-xl text-xs font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Another Week Button */}
        <button
          onClick={handleAddNextWeek}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-warm-300 dark:border-warm-800 hover:border-focus-400 text-warm-600 dark:text-warm-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-warm-50 dark:hover:bg-warm-850 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Next Week's Target</span>
        </button>
      </div>
    </div>
  );
};
