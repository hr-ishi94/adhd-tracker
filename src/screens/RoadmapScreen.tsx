import React, { useState } from 'react';
import type { DreamAssessment, WeeklyPlan, LearningTopic } from '../types';
import {
  Sparkles,
  Check,
  RotateCcw,
  X,
  Flame,
  ChevronDown,
  Star,
  Atom,
  Network,
  Hammer,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ART, SegmentedTabs, Checkbox, ProgressBar, HeroBanner, Page } from '../components/ui';

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


// Cycling colored icon tiles for topic / sprint rows
const TILE_STYLES = [
  'bg-honey-200 text-warm-800 dark:bg-honey-900/50 dark:text-honey-200',
  'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
  'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
];

const badgeText = (title: string) => {
  const words = title.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return '•';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const IconTile: React.FC<{ index: number; title: string }> = ({ index, title }) => {
  const i = index % TILE_STYLES.length;
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TILE_STYLES[i]}`}>
      {i === 0 && <span className="text-[13px] font-black tracking-tight">{badgeText(title)}</span>}
      {i === 1 && <Atom className="w-5 h-5" />}
      {i === 2 && <Network className="w-5 h-5" />}
      {i === 3 && <Hammer className="w-5 h-5" />}
    </div>
  );
};

const ProgressRing: React.FC<{ value: number }> = ({ value }) => {
  const r = 17;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative w-10 h-10 shrink-0">
      <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="stroke-warm-200 dark:stroke-warm-800" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className="stroke-honey-400 transition-all duration-500"
        />
      </svg>
      <Star className="absolute inset-0 m-auto w-4 h-4 text-honey-500 fill-honey-400" />
    </div>
  );
};

type RoadmapTab = 'current' | 'all';

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
  const [tab, setTab] = useState<RoadmapTab>('current');

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
    setTab('current');

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E0621F', '#F5B700', '#F38B45', '#2F4A31'],
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

  // Mark every step in a week done (or undo all if already done)
  const handleToggleWeek = (weekId: string) => {
    if (!dreamAssessment) return;
    const updated = dreamAssessment.weeklyPlans.map((w) => {
      if (w.id !== weekId) return w;
      const allDone = w.topics.length > 0 && w.topics.every((t) => t.completed);
      return { ...w, topics: w.topics.map((t) => ({ ...t, completed: !allDone })) };
    });
    onUpdateDreamAssessment({ ...dreamAssessment, weeklyPlans: updated });
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

  const inputClass =
    'w-full text-sm bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-800 rounded-xl px-3.5 py-2.5 text-warm-800 dark:text-warm-100 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-focus-500/60';

  // -------------------------------------------------------------
  // VIEW 1: SUPER-SIMPLE 3-STEP SETUP (ZERO ANXIETY)
  // -------------------------------------------------------------
  if (isTakingAssessment) {
    return (
      <Page>
        <HeroBanner src={ART.roadmapHero} className="h-[150px]">
          <div className="px-5 pt-4 safe-top">
            <h1 className="text-[24px] leading-tight font-extrabold tracking-tight text-warm-800">What will you master?</h1>
            <p className="text-xs text-warm-700/80 mt-0.5 max-w-[220px]">
              We'll break it into calm, bite-sized weekly steps.
            </p>
          </div>
        </HeroBanner>

        <form onSubmit={handleBuildRoadmap} className="px-4 -mt-6 relative z-20 space-y-3">
          {/* STEP 1: CHOOSE TARGET SKILL */}
          <div className="card p-4 space-y-3">
            <label className="text-[15px] font-bold text-warm-800 dark:text-warm-100 block">
              1. Select or type your skill
            </label>

            <div className="flex flex-wrap gap-2">
              {Object.keys(SKILL_TEMPLATES).map((skillName) => {
                const isSelected = !isCustomSkill && selectedSkill === skillName;
                return (
                  <button
                    key={skillName}
                    type="button"
                    onClick={() => handleSelectPreset(skillName)}
                    className={`chip inline-flex items-center gap-1 ${isSelected ? 'chip-active' : ''}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{skillName}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsCustomSkill(true)}
                className={`chip inline-flex items-center gap-1 ${isCustomSkill ? 'chip-active' : ''}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom skill</span>
              </button>
            </div>

            {isCustomSkill && (
              <input
                type="text"
                required={isCustomSkill}
                placeholder="e.g. 3D Modeling, Python Automation, Piano..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                className={inputClass}
              />
            )}
          </div>

          {/* STEP 2: CHOOSE PACE */}
          <div className="card p-4 space-y-3">
            <label className="text-[15px] font-bold text-warm-800 dark:text-warm-100 block">2. Choose your pace</label>
            <SegmentedTabs
              options={[
                { id: '4', label: '4 weeks' },
                { id: '8', label: '8 weeks' },
                { id: '12', label: '12 weeks' },
              ]}
              value={String(weeksChoice) as '4' | '8' | '12'}
              onChange={(id) => setWeeksChoice(Number(id))}
            />
            <p className="text-xs text-warm-500 dark:text-warm-400 text-center">
              {weeksChoice === 4 ? 'Fast sprint' : weeksChoice === 12 ? 'Deep mastery' : 'Recommended pace'}
            </p>
          </div>

          {/* STEP 3: MOTIVATION ANCHOR */}
          <div className="card p-4 space-y-2">
            <label className="text-[15px] font-bold text-warm-800 dark:text-warm-100 block">3. Your motivation / 'why'</label>
            <input
              type="text"
              value={motivationText}
              onChange={(e) => setMotivationText(e.target.value)}
              placeholder="Why does mastering this matter to you?"
              className={inputClass}
            />
          </div>

          {/* Action Button */}
          <div className="flex gap-2.5 pt-1">
            {dreamAssessment && (
              <button
                type="button"
                onClick={() => setIsTakingAssessment(false)}
                className="py-3.5 px-5 rounded-full bg-warm-200/70 dark:bg-warm-800 text-warm-700 dark:text-warm-300 font-bold text-sm"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary flex-1 py-3.5 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Generate My Roadmap</span>
            </button>
          </div>
        </form>
      </Page>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ROADMAP (ONE SPRINT / WEEK FOCUS AT A TIME)
  // -------------------------------------------------------------
  const weeklyPlans = dreamAssessment?.weeklyPlans || [];
  const activeWeek = weeklyPlans.find((w) => w.id === expandedWeekId) || weeklyPlans[0];
  const totalWeeks = weeklyPlans.length || dreamAssessment?.targetWeeks || 0;
  const weekDone = activeWeek ? activeWeek.topics.filter((t) => t.completed).length : 0;
  const weekTotal = activeWeek ? activeWeek.topics.length : 0;
  const weekPercent = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
  const rewardCoins = Math.max(1, weekTotal) * 50;

  const rowBase = 'flex items-center gap-3 py-3 border-b border-warm-200/70 dark:border-warm-800 last:border-b-0';

  return (
    <Page>
      <HeroBanner src={ART.roadmapHero} className="h-[150px]">
        <div className="flex items-start justify-between gap-3 px-5 pt-4 safe-top">
          <h1 className="text-[24px] leading-tight font-extrabold tracking-tight text-warm-800">Learning Roadmap</h1>
          <label className="relative shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 text-warm-800 text-xs font-semibold shadow-sm cursor-pointer">
            <span>{dreamAssessment?.targetWeeks || totalWeeks}-week plan</span>
            <ChevronDown className="w-3.5 h-3.5 text-warm-500" />
            <select
              aria-label="Select sprint week"
              value={activeWeek?.id || ''}
              onChange={(e) => {
                setExpandedWeekId(e.target.value);
                setTab('current');
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              {weeklyPlans.map((w) => (
                <option key={w.id} value={w.id}>
                  Week {w.weekNumber}: {w.skillTitle}
                </option>
              ))}
            </select>
          </label>
        </div>
      </HeroBanner>

      <div className="px-4 -mt-8 relative z-20 space-y-3">
        {/* Summary card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold text-warm-800 dark:text-warm-50 truncate">{dreamAssessment?.dreamTitle}</h2>
              <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                Week {activeWeek?.weekNumber ?? 1} of {totalWeeks}
              </p>
            </div>
            <ProgressRing value={progressPercent} />
            <span className="text-[15px] font-extrabold text-warm-800 dark:text-warm-50 w-10 text-right">{progressPercent}%</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-warm-200/70 dark:border-warm-800">
            <p className="text-xs text-warm-500 dark:text-warm-400 italic truncate">
              {dreamAssessment?.motivation ? `"${dreamAssessment.motivation}"` : `${completedTopics} of ${totalTopics} steps done`}
            </p>
            <button
              type="button"
              onClick={() => setIsTakingAssessment(true)}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-focus-600 dark:text-focus-400"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>
        </div>

        {/* Sprint list container */}
        <div className="card p-4">
          <SegmentedTabs<RoadmapTab>
            options={[
              { id: 'current', label: 'Current Sprint' },
              { id: 'all', label: 'All Sprints' },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'current' && activeWeek && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-warm-500 dark:text-warm-400 px-0.5">
                Week {activeWeek.weekNumber} · {activeWeek.skillTitle}
              </p>

              <div className="mt-1">
                {activeWeek.topics.map((topic, idx) => (
                  <div key={topic.id} className={rowBase}>
                    <IconTile index={idx} title={topic.title} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-bold leading-snug ${
                          topic.completed ? 'line-through text-warm-400 dark:text-warm-500' : 'text-warm-800 dark:text-warm-50'
                        }`}
                      >
                        {topic.title}
                      </p>
                      <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                        Step {idx + 1} of {weekTotal} · {topic.completed ? 'Done' : 'To do'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTopic(activeWeek.id, topic.id)}
                      className="text-warm-400 hover:text-rose-500 p-1 shrink-0"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <Checkbox
                      checked={topic.completed}
                      onChange={() => handleToggleTopic(activeWeek.id, topic.id)}
                      label={`Mark ${topic.title} complete`}
                    />
                  </div>
                ))}
                {activeWeek.topics.length === 0 && (
                  <p className="text-xs text-warm-500 dark:text-warm-400 py-4 text-center">No steps yet — add one below.</p>
                )}
              </div>

              {/* Quick 1-tap Add Step */}
              <div className="flex gap-2 pt-3">
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
                  className={`${inputClass} flex-1 py-2`}
                />
                <button
                  type="button"
                  onClick={() => handleAddTopicToActiveWeek(activeWeek.id)}
                  className="btn-pill shrink-0 px-4"
                >
                  + Add
                </button>
              </div>

              {onStartPomodoro && (
                <button type="button" onClick={onStartPomodoro} className="btn-primary w-full py-3 mt-3 text-sm">
                  <Flame className="w-4 h-4" />
                  <span>Start 25m Focus Sprint</span>
                </button>
              )}
            </div>
          )}

          {tab === 'all' && (
            <div className="mt-2">
              {weeklyPlans.map((w, idx) => {
                const done = w.topics.filter((t) => t.completed).length;
                const isWeekDone = w.topics.length > 0 && done === w.topics.length;
                const isActive = w.id === activeWeek?.id;
                return (
                  <div key={w.id} className={rowBase}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedWeekId(w.id);
                        setTab('current');
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <IconTile index={idx} title={w.skillTitle} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-warm-800 dark:text-warm-50 leading-snug truncate">
                          {w.skillTitle}
                        </p>
                        <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                          Week {w.weekNumber} · {done} / {w.topics.length} steps
                          {isActive && <span className="text-focus-600 dark:text-focus-400 font-semibold"> · Current</span>}
                        </p>
                      </div>
                    </button>
                    <Checkbox
                      checked={isWeekDone}
                      onChange={() => handleToggleWeek(w.id)}
                      label={`Mark week ${w.weekNumber} complete`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Milestone Reward */}
        {activeWeek && (
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold text-warm-800 dark:text-warm-50">Milestone Reward</h3>
                <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">Complete this sprint to earn</p>
              </div>
              <img src={ART.chest} alt="" aria-hidden="true" className="w-12 h-12 object-contain shrink-0 select-none" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <ProgressBar
                value={weekPercent}
                className="h-2.5 flex-1 bg-warm-200 dark:bg-warm-800"
                barClassName="bg-gradient-to-r from-honey-400 to-focus-500"
              />
              <span className="text-[11px] font-semibold text-warm-500 dark:text-warm-400 whitespace-nowrap">{rewardCoins} coins</span>
              <span className="text-xs font-extrabold text-warm-800 dark:text-warm-50 w-9 text-right">{weekPercent}%</span>
            </div>
          </div>
        )}

        {/* Compassionate ADHD tip */}
        <p className="text-xs text-warm-500 dark:text-warm-400 text-center px-4 pt-1">
          Only focus on today's single step in Week {activeWeek?.weekNumber}. Future weeks can wait.
        </p>
      </div>
    </Page>
  );
};
