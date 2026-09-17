import React, { useState } from 'react';
import type { DreamAssessment, WeeklyPlan, LearningTopic } from '../types';
import { 
  Target, 
  Sparkles, 
  Check, 
  RotateCcw, 
  X,
  Flame,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoadmapScreenProps {
  dreamAssessment?: DreamAssessment | null;
  onUpdateDreamAssessment: (assessment: DreamAssessment | null) => void;
  onStartPomodoro?: () => void;
}

// Preset skill templates that generate meaningful weekly curriculums
const SKILL_TEMPLATES: Record<string, { weeks4: string[]; weeks8: string[]; weeks12: string[] }> = {
  'Full-Stack Web Dev': {
    weeks4: [
      'HTML/CSS, Modern JS & Web Basics',
      'React & Component Architecture',
      'Backend APIs, Databases & Server State',
      'Full Project Integration & Deployment',
    ],
    weeks8: [
      'HTML/CSS & Modern JavaScript',
      'React Fundamentals & State',
      'Advanced React & Hooks',
      'Node.js & REST APIs',
      'Databases (SQL & ORM)',
      'Authentication & Security',
      'Full-Stack Portfolio Project',
      'Deployment, Testing & Polish',
    ],
    weeks12: [
      'Web Architecture & Modern JavaScript',
      'TypeScript Essentials',
      'React Core & Component Patterns',
      'Next.js & Server Components',
      'Tailwind & Accessible UI Design',
      'Node.js & Express / Fastify',
      'Relational Databases & PostgreSQL',
      'Authentication, Sessions & JWT',
      'State Management & Caching',
      'Real-time Features & WebSockets',
      'Testing & CI/CD Pipelines',
      'Capstone Production Launch',
    ],
  },
  'Mobile App Creator': {
    weeks4: [
      'React Native / Flutter Setup & UI',
      'State Management & Navigation',
      'Device APIs, Storage & Camera',
      'App Store Polish & Export',
    ],
    weeks8: [
      'Mobile UI Framework Basics',
      'Screens & Navigation Hierarchy',
      'Managing State & Data Flow',
      'Integrating Backend REST APIs',
      'Local Storage & Offline Support',
      'Animations & Gesture Handling',
      'Beta Testing on Real Device',
      'App Store / Play Store Release',
    ],
    weeks12: [
      'Mobile Platform Architecture',
      'Components & Responsive Styling',
      'Navigation & Deep Linking',
      'Global State Management',
      'Networking & Offline-first Sync',
      'Push Notifications & Background Tasks',
      'Camera, Geolocation & Native APIs',
      'Performance Profiling & Memory',
      'In-App Purchases & Analytics',
      'End-to-End Mobile Testing',
      'App Store Optimization (ASO)',
      'Production Release & Monitoring',
    ],
  },
  'AI & Machine Learning': {
    weeks4: [
      'Python, NumPy & Data Wrangling',
      'Classic ML Algorithms & Scikit-Learn',
      'Neural Networks & PyTorch Basics',
      'LLMs, Prompt Engineering & Agents',
    ],
    weeks8: [
      'Python & Math for Machine Learning',
      'Data Analysis & Visualization',
      'Supervised Learning & Regression',
      'Classification & Model Evaluation',
      'Deep Learning & PyTorch',
      'Computer Vision or NLP Basics',
      'LLM Tools, RAG & Vector Databases',
      'Deploying AI Models as APIs',
    ],
    weeks12: [
      'Python for High-Performance Computing',
      'Linear Algebra & Calculus Intuition',
      'Exploratory Data Analysis',
      'Classical Machine Learning Models',
      'Gradient Boosting & Ensembles',
      'Neural Network Foundations',
      'Transformers & Attention Mechanism',
      'Fine-tuning Open-Weight LLMs',
      'Retrieval Augmented Generation (RAG)',
      'Agentic Workflows & Multi-Agent Systems',
      'Model Evaluation & Guardrails',
      'Production AI System Deployment',
    ],
  },
  'UI/UX Product Design': {
    weeks4: [
      'Figma Basics & Design Thinking',
      'Wireframing & Information Architecture',
      'High-Fidelity UI & Color Palettes',
      'Interactive Prototyping & User Testing',
    ],
    weeks8: [
      'Design Psychology & Human Interface',
      'User Research & Empathy Maps',
      'Information Architecture & Flows',
      'Figma Components & Auto Layout',
      'Typography, Spacing & Color Schemes',
      'Design Systems & Tokens',
      'Interactive Prototyping & Micro-interactions',
      'Portfolio Case Study Presentation',
    ],
    weeks12: [
      'Design Thinking & Problem Discovery',
      'User Research & Interviewing',
      'Competitive Analysis & Personas',
      'Information Architecture & Wireframes',
      'Figma Advanced Layouts & Variants',
      'Typography Systems & Visual Hierarchy',
      'Design Tokens & Scale Variables',
      'Accessibility (WCAG) Standards',
      'Micro-interactions & Animation',
      'Usability Testing & Feedback Loops',
      'Developer Handoff & Specs',
      'Comprehensive Case Study Launch',
    ],
  },
  'DSA & Problem Solving': {
    weeks4: [
      'Arrays, HashMaps & Two Pointers',
      'Linked Lists, Stacks & Queues',
      'Binary Search & Trees',
      'Graphs & Dynamic Programming Basics',
    ],
    weeks8: [
      'Time/Space Complexity & Arrays',
      'Two Pointers & Sliding Window',
      'HashMaps, Sets & Frequency Counting',
      'Linked Lists & Fast/Slow Pointers',
      'Binary Trees & Traversals',
      'Binary Search & Monotonic Conditions',
      'Graph BFS/DFS & Topo Sort',
      'Dynamic Programming Patterns',
    ],
    weeks12: [
      'Big-O & Memory Analysis',
      'Array Manipulations & Prefix Sums',
      'Sliding Window & Two Pointers',
      'Hash Tables & String Algorithms',
      'Stacks, Monotonic Stacks & Queues',
      'Binary Search In-Depth',
      'Binary Trees & BSTs',
      'Heaps & Priority Queues',
      'Backtracking & Recursion',
      'Graph Algorithms (BFS/DFS/Dijkstra)',
      '1D & 2D Dynamic Programming',
      'Mock Interview & System Problem Solving',
    ],
  },
};

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({
  dreamAssessment,
  onUpdateDreamAssessment,
  onStartPomodoro,
}) => {
  const [isTakingAssessment, setIsTakingAssessment] = useState(!dreamAssessment);

  // Simplified Setup State
  const [selectedSkill, setSelectedSkill] = useState<string>(dreamAssessment?.dreamTitle || 'Full-Stack Web Dev');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');
  const [isCustomSkill, setIsCustomSkill] = useState<boolean>(false);
  const [weeksChoice, setWeeksChoice] = useState<number>(dreamAssessment?.targetWeeks || 8);
  const [motivationText, setMotivationText] = useState<string>(
    dreamAssessment?.motivation || 'Build real projects, stay consistent, and achieve career freedom.'
  );

  // Expanded week state
  const [expandedWeekId, setExpandedWeekId] = useState<string>('week-1');
  const [newTopicText, setNewTopicText] = useState<string>('');

  const handleSelectPreset = (skill: string) => {
    setSelectedSkill(skill);
    setIsCustomSkill(false);
  };

  const handleBuildRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = isCustomSkill ? (customSkillInput.trim() || 'My Target Skill') : selectedSkill;

    // Get weekly curriculum titles
    let weekTitles: string[] = [];
    const template = SKILL_TEMPLATES[finalTitle];
    if (template) {
      if (weeksChoice === 4) weekTitles = template.weeks4;
      else if (weeksChoice === 12) weekTitles = template.weeks12;
      else weekTitles = template.weeks8;
    } else {
      // Default generative steps for custom skills
      for (let i = 1; i <= weeksChoice; i++) {
        if (i === 1) weekTitles.push('Foundations & Core Setup');
        else if (i === 2) weekTitles.push('Key Principles & Patterns');
        else if (i === Math.floor(weeksChoice / 2)) weekTitles.push('Hands-on Mini Project');
        else if (i === weeksChoice - 1) weekTitles.push('Advanced Techniques & Integration');
        else if (i === weeksChoice) weekTitles.push('Portfolio Project & Final Polish');
        else weekTitles.push(`Module ${i}: Practical Application`);
      }
    }

    const weeklyPlans: WeeklyPlan[] = weekTitles.map((title, idx) => ({
      id: `week-${idx + 1}`,
      weekNumber: idx + 1,
      skillTitle: title,
      topics: [
        { id: `t-${idx + 1}-1`, title: `Learn key concepts of ${title}`, completed: false },
        { id: `t-${idx + 1}-2`, title: 'Complete 1 practical practice exercise', completed: false },
        { id: `t-${idx + 1}-3`, title: 'Milestone checkpoint review', completed: false },
      ],
    }));

    const newAssessment: DreamAssessment = {
      id: `dream-${Date.now()}`,
      dreamTitle: finalTitle,
      researchStatus: 'in_progress',
      targetWeeks: weeksChoice,
      startDate: new Date().toISOString(),
      motivation: motivationText.trim() || 'Build real projects and achieve creative freedom.',
      weeklyPlans,
    };

    onUpdateDreamAssessment(newAssessment);
    setIsTakingAssessment(false);
    setExpandedWeekId('week-1');

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

  const handleToggleTopic = (weekId: string, topicId: string) => {
    if (!dreamAssessment) return;
    const updated = dreamAssessment.weeklyPlans.map((w) => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        topics: w.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t)),
      };
    });

    onUpdateDreamAssessment({
      ...dreamAssessment,
      weeklyPlans: updated,
    });
  };

  const handleAddTopicToActiveWeek = (weekId: string) => {
    if (!dreamAssessment || !newTopicText.trim()) return;

    const newTopic: LearningTopic = {
      id: `t-${Date.now()}`,
      title: newTopicText.trim(),
      completed: false,
    };

    const updated = dreamAssessment.weeklyPlans.map((w) => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        topics: [...w.topics, newTopic],
      };
    });

    onUpdateDreamAssessment({
      ...dreamAssessment,
      weeklyPlans: updated,
    });
    setNewTopicText('');
  };

  const handleDeleteTopic = (weekId: string, topicId: string) => {
    if (!dreamAssessment) return;
    const updated = dreamAssessment.weeklyPlans.map((w) => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        topics: w.topics.filter((t) => t.id !== topicId),
      };
    });

    onUpdateDreamAssessment({
      ...dreamAssessment,
      weeklyPlans: updated,
    });
  };

  // Calculations
  const allTopics = dreamAssessment?.weeklyPlans.flatMap((w) => w.topics) || [];
  const completedTopics = allTopics.filter((t) => t.completed).length;
  const totalTopics = allTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // -------------------------------------------------------------
  // VIEW 1: SUPER-SIMPLE 3-STEP SETUP (ZERO ANXIETY)
  // -------------------------------------------------------------
  if (isTakingAssessment) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-24 safe-top space-y-4">
        {/* Simple Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-focus-100 dark:bg-focus-900/40 text-focus-700 dark:text-focus-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-focus-600" />
            <span>Calm Skill Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 tracking-tight">
            What will you master?
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400 max-w-xs mx-auto">
            Choose a target. We'll automatically break it down into calm, bite-sized weekly steps.
          </p>
        </div>

        <form onSubmit={handleBuildRoadmap} className="space-y-4">
          {/* STEP 1: CHOOSE TARGET SKILL */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-3">
            <label className="text-xs font-black uppercase text-warm-500 dark:text-warm-400 tracking-wider block">
              1. Select or Type Your Skill
            </label>

            <div className="grid grid-cols-2 gap-2">
              {Object.keys(SKILL_TEMPLATES).map((skillName) => {
                const isSelected = !isCustomSkill && selectedSkill === skillName;
                return (
                  <button
                    key={skillName}
                    type="button"
                    onClick={() => handleSelectPreset(skillName)}
                    className={`p-2.5 rounded-2xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-focus-500 bg-focus-50 dark:bg-focus-950/60 text-focus-800 dark:text-focus-300 shadow-xs'
                        : 'border-warm-200/80 dark:border-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-50'
                    }`}
                  >
                    <span className="truncate">{skillName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-focus-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Option */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsCustomSkill(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  isCustomSkill 
                    ? 'border-focus-500 bg-focus-50 dark:bg-focus-950/60 text-focus-700' 
                    : 'border-warm-200 dark:border-warm-800 text-warm-500'
                }`}
              >
                + Custom Skill
              </button>

              {isCustomSkill && (
                <input
                  type="text"
                  required={isCustomSkill}
                  placeholder="e.g. 3D Modeling, Python Automation, Piano..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  className="mt-2 w-full text-sm font-semibold bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-2.5 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
                />
              )}
            </div>
          </div>

          {/* STEP 2: CHOOSE PACE */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-3">
            <label className="text-xs font-black uppercase text-warm-500 dark:text-warm-400 tracking-wider block">
              2. Choose Your Pace
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { weeks: 4, label: '4 Weeks', sub: 'Fast Sprint' },
                { weeks: 8, label: '8 Weeks', sub: 'Recommended' },
                { weeks: 12, label: '12 Weeks', sub: 'Deep Mastery' },
              ].map((item) => (
                <button
                  key={item.weeks}
                  type="button"
                  onClick={() => setWeeksChoice(item.weeks)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    weeksChoice === item.weeks
                      ? 'border-focus-500 bg-focus-600 text-white shadow-lifted'
                      : 'border-warm-200/80 dark:border-warm-800 bg-warm-50/50 dark:bg-warm-900/40 text-warm-700 dark:text-warm-300'
                  }`}
                >
                  <span className="block text-sm font-black leading-tight">{item.label}</span>
                  <span className={`text-[10px] font-bold block mt-0.5 ${
                    weeksChoice === item.weeks ? 'text-focus-100' : 'text-warm-400'
                  }`}>
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: MOTIVATION ANCHOR */}
          <div className="bg-white dark:bg-warm-850 p-4 rounded-3xl border border-warm-200/90 dark:border-warm-800 shadow-soft space-y-2">
            <label className="text-xs font-black uppercase text-warm-500 dark:text-warm-400 tracking-wider block">
              3. Your Motivation / 'Why'
            </label>
            <input
              type="text"
              value={motivationText}
              onChange={(e) => setMotivationText(e.target.value)}
              placeholder="Why does mastering this matter to you?"
              className="w-full text-xs sm:text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-2.5 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
            />
          </div>

          {/* Action Button */}
          <div className="flex gap-2.5 pt-1">
            {dreamAssessment && (
              <button
                type="button"
                onClick={() => setIsTakingAssessment(false)}
                className="py-3.5 px-4 rounded-2xl bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-bold text-xs"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl bg-focus-600 hover:bg-focus-700 text-white font-black text-sm shadow-lifted active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My Roadmap</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ULTRA-CALM ROADMAP (ONE WEEK FOCUS AT A TIME)
  // -------------------------------------------------------------
  const activeWeek = dreamAssessment?.weeklyPlans.find((w) => w.id === expandedWeekId) || dreamAssessment?.weeklyPlans[0];

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 pt-3 pb-28 safe-top space-y-4">
      {/* Hero Overview Card matching reference design */}
      <div className="glass-card-warm rounded-[28px] p-5 border border-white/70 dark:border-white/10 shadow-lifted space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-focus-100 dark:bg-focus-950/80 text-focus-800 dark:text-focus-300 text-xs font-black uppercase tracking-wider border border-focus-300/50">
            <Target className="w-3.5 h-3.5 text-focus-600" />
            <span>Target Goal</span>
          </div>

          <button
            onClick={() => setIsTakingAssessment(true)}
            className="text-xs font-bold text-focus-700 dark:text-focus-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Change Skill</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-900 dark:text-warm-100 tracking-tight leading-tight">
            {dreamAssessment?.dreamTitle}
          </h1>
          {dreamAssessment?.motivation && (
            <p className="text-xs text-warm-600 dark:text-warm-300 italic mt-1 leading-relaxed">
              "{dreamAssessment.motivation}"
            </p>
          )}
        </div>

        {/* Calm Progress Bar */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-warm-600 dark:text-warm-300">
              Mastery: <strong className="text-focus-600 dark:text-focus-400 font-black">{progressPercent}%</strong>
            </span>
            <span className="text-warm-500 font-medium">
              {completedTopics} of {totalTopics} items completed
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-warm-200 dark:bg-warm-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-focus-500 to-leaf-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Launch Pomodoro */}
        {onStartPomodoro && (
          <button
            onClick={onStartPomodoro}
            className="w-full py-3 rounded-2xl bg-white dark:bg-warm-800 border border-focus-200 dark:border-focus-800 text-focus-700 dark:text-focus-300 font-black text-xs shadow-xs hover:border-focus-400 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Flame className="w-4 h-4 text-focus-600" />
            <span>Start 25m Focus Sprint on This Week →</span>
          </button>
        )}
      </div>

      {/* Week Selector Chips (Single-tap to switch active week without cognitive overload) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-warm-500 dark:text-warm-400 px-1 uppercase tracking-wider block">
          Select Milestone Week:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {dreamAssessment?.weeklyPlans.map((w) => {
            const isSelected = w.id === activeWeek?.id;
            const isWeekDone = w.topics.length > 0 && w.topics.every((t) => t.completed);

            return (
              <button
                key={w.id}
                onClick={() => setExpandedWeekId(w.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-focus-600 text-white border-focus-600 shadow-sm scale-105'
                    : isWeekDone
                      ? 'bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300 border-leaf-300'
                      : 'glass-card text-warm-700 dark:text-warm-300 border-white/60 dark:border-warm-800'
                }`}
              >
                {isWeekDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Week {w.weekNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE WEEK FOCUS CARD (Only 1 week highlighted at a time to prevent ADHD anxiety) */}
      {activeWeek && (
        <div className="glass-card rounded-[28px] p-5 border border-white/70 dark:border-white/10 shadow-lifted space-y-4">
          <div className="flex items-start justify-between gap-2 border-b border-warm-100 dark:border-warm-800 pb-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-focus-600 dark:text-focus-400">
                Week {activeWeek.weekNumber} Milestone
              </span>
              <h2 className="text-lg font-black text-warm-900 dark:text-warm-100 leading-snug mt-0.5">
                {activeWeek.skillTitle}
              </h2>
            </div>
            <span className="text-xs font-bold text-warm-500 bg-warm-100 dark:bg-warm-800 px-2.5 py-1 rounded-xl shrink-0">
              {activeWeek.topics.filter((t) => t.completed).length} / {activeWeek.topics.length} Done
            </span>
          </div>

          {/* Checkable Action Steps */}
          <div className="space-y-2">
            {activeWeek.topics.map((topic) => (
              <div
                key={topic.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  topic.completed
                    ? 'bg-leaf-50/50 dark:bg-leaf-950/30 border-leaf-200 dark:border-leaf-900/60'
                    : 'bg-warm-50/80 dark:bg-warm-900/60 border-warm-200/70 dark:border-warm-800'
                }`}
              >
                <label className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={topic.completed}
                    onChange={() => handleToggleTopic(activeWeek.id, topic.id)}
                    className="w-5 h-5 rounded-lg text-focus-600 focus:ring-focus-500 border-warm-300 dark:border-warm-700 cursor-pointer"
                  />
                  <span className={`text-xs sm:text-sm font-semibold leading-snug ${
                    topic.completed
                      ? 'line-through text-warm-400 dark:text-warm-500'
                      : 'text-warm-900 dark:text-warm-100'
                  }`}>
                    {topic.title}
                  </span>
                </label>

                <button
                  onClick={() => handleDeleteTopic(activeWeek.id, topic.id)}
                  className="text-warm-400 hover:text-red-500 p-1 shrink-0"
                  title="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick 1-tap Add Step */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add step or exercise..."
              value={newTopicText}
              onChange={(e) => setNewTopicText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTopicToActiveWeek(activeWeek.id);
                }
              }}
              className="flex-1 text-xs sm:text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3 py-2 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-focus-500"
            />
            <button
              onClick={() => handleAddTopicToActiveWeek(activeWeek.id)}
              className="px-4 py-2 bg-focus-600 hover:bg-focus-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs shrink-0"
            >
              + Add
            </button>
          </div>
        </div>
      )}

      {/* Compassionate ADHD tip */}
      <div className="p-3.5 rounded-2xl bg-warm-100/60 dark:bg-warm-850/60 border border-warm-200/70 dark:border-warm-800 text-center">
        <p className="text-xs text-warm-600 dark:text-warm-400 font-medium">
          💡 <strong>ADHD Tip:</strong> Only focus on today's single action step in Week {activeWeek?.weekNumber}. Ignore future weeks until you get there!
        </p>
      </div>
    </div>
  );
};
