# SPEC.md â€” Daily Focus (ADHD Routine Tracker)

## 1. Purpose

A minimal, mobile-first, client-side-only web app that tracks one person's daily routine blocks (wake, learning, gym, office, evening project, review, sleep), reminds them at each session, and gives light, non-punitive positive feedback for consistency. Built for a single user with ADHD â€” every design decision optimizes for **low friction, single-focus, and no shame.**

No login, no backend, no database. All data lives in the browser on the user's phone.

---

## 2. Core Design Principles (non-negotiable)

1. **One thing on screen at a time.** The home screen shows only the *current* block and the *next* block â€” never the full day's list by default (that's overwhelming and invites re-planning instead of doing).
2. **Zero setup friction.** Opening the app should take < 2 seconds to see "what do I do right now."
3. **No shame mechanics.** Missed a block? No red X, no broken-streak guilt language. A miss justâ€¦ happens, and the app moves on to the next block.
4. **Capture over control.** The brain-dump box must always be one tap away, from any screen.
5. **Offline-first.** Must work with no internet connection (it's just local data).
6. **Installable like a native app.** PWA â€” "Add to Home Screen" on the phone, opens full-screen, no browser chrome.

---

## 3. Tech Stack (client-side only)

- **Framework:** Vite + React (lighter and simpler for a static PWA than Next.js, since there's no server-rendering need at all)
- **Styling:** Tailwind CSS
- **State/Storage:** Browser `localStorage` (via a small typed wrapper) â€” no IndexedDB needed at this data volume
- **Reminders:** Web Notifications API + a Service Worker, scheduled client-side (see Â§9 for limitations)
- **PWA:** `manifest.json` + service worker (via `vite-plugin-pwa`) for installability and offline caching
- **Deployment:** Vercel, static build output (`vercel.json` with `"framework": null`, output directory `dist`), **zero serverless functions, zero environment variables**
- **No backend. No database. No auth. No analytics SDKs.**

---

## 4. Core Features (v1 / MVP)

### 4.1 Today screen (home)
- Shows **only** the current block (large, centered) and the next block (small, below).
- Each block has: name, time range, category tag (learning / gym / office / project / review / sleep).
- One primary action per block: **Done** / **Skip** â€” that's it. No sub-menus.
- A subtle progress strip at the very top (dots or a thin bar) shows today's blocks completed vs. total, without listing them out â€” glanceable, not a to-do list.

### 4.2 One Priority Card
- Pinned at the top: a single editable text field â€” "Today's one thing."
- Prompted to fill it each morning; carried over/editable during the evening review for the next day.
- Deliberately **one field, not a list** â€” this is the ADHD-specific fix for goal-switching.

### 4.3 Brain Dump (always-accessible)
- Floating action button, visible on every screen.
- Opens a bare textbox â†’ Save. No categorization required at capture time (categorizing later is a separate, optional step) â€” the point is to get the thought out of working memory fast.
- A separate "Inbox" screen lists dumped items; each can be turned into a task, deleted, or left alone.

### 4.4 Reminders
- At each block's start time, fire a local notification: "It's [block name] time." Plain, factual tone â€” no exclamation points, no guilt.
- Snooze options: 5 / 10 / 15 min.
- Notification tap opens directly to the Today screen.

### 4.5 Evening Review (3 questions, < 60 seconds)
1. What got done today? (auto-filled from Done taps, editable)
2. What slipped?
3. Why? (quick-select: *too big / bored / no time / forgot / low energy* â€” tap, don't type)
- Saves as one log entry per day. No word-count minimum, no required fields beyond block completion.

### 4.6 Weekly Retro
- Simple week view: which blocks were consistently done vs. consistently skipped (a pattern view, not a grade).
- One free-text box: "What do I want to change next week?"
- No streak-shaming language anywhere in this view.

### 4.7 Rewarding feedback (light touch, not gamified addiction)
- A "current streak" and "best streak" counter â€” but a missed day **pauses**, it does not reset to zero. Framing matters: "3 days since your streak paused" not "Streak broken."
- A brief, quiet animation on completing *all* blocks in a day (respects `prefers-reduced-motion`).
- No points, levels, badges, or leaderboards â€” those create a second thing to obsess over, which defeats the purpose.

### 4.8 Task Breakdown helper
- On any block, an optional "Break it down" link opens one input: "First 10-minute step." No AI, no backend â€” just a prompt that turns a vague task into a concrete next action.

### 4.9 Settings
- Edit routine blocks (name, start/end time, category) â€” the user's routine will change over time (it already has three times in one conversation).
- Toggle notification permission.
- Export/import data as a JSON file (since there's no cloud backup, this is the user's manual safety net).
- Reset all data.

---

## 5. Non-Goals (explicitly out of scope for v1)

- No accounts, login, or cloud sync
- No AI-powered features requiring an API key or backend call
- No social features, sharing, or leaderboards
- No complex analytics/charts beyond the simple weekly pattern view
- No true background push notifications when the app is fully closed (see Â§9)

---

## 6. Data Model (localStorage, JSON)

```ts
type RoutineBlock = {
  id: string;
  name: string;
  startTime: string; // "05:30"
  endTime: string;   // "07:00"
  category: "learning" | "gym" | "office" | "project" | "review" | "sleep" | "personal";
};

type DailyLog = {
  date: string; // "2026-09-14"
  priority: string;
  blockStatus: Record<string, "done" | "skipped" | "pending">; // keyed by RoutineBlock.id
  reviewWhatGotDone: string;
  reviewWhatSlipped: string;
  reviewWhy: "too_big" | "bored" | "no_time" | "forgot" | "low_energy" | null;
};

type BrainDumpItem = {
  id: string;
  text: string;
  createdAt: string; // ISO timestamp
  convertedToTask: boolean;
};

type Streak = {
  current: number;
  best: number;
  lastCompletedDate: string | null;
};
```

All four live under a single localStorage key (e.g. `focus-app-data`) as one JSON blob, read/written together to avoid partial-write bugs.

---

## 7. Screens

1. **Today** (default/home) â€” current block, next block, priority card, progress strip, brain-dump FAB
2. **Inbox** â€” brain-dumped items
3. **Evening Review** â€” 3-question form
4. **Weekly Retro** â€” pattern view + free-text notes
5. **Settings** â€” edit routine, notifications, export/import, reset

Mobile-first, single column, bottom tab bar with 5 icons max (Today / Inbox / Review / Retro / Settings). Large touch targets (min 44px). No hamburger menus â€” everything reachable in one tap from the tab bar.

---

## 8. Visual Design Direction

The subject is a tool opened in 5-second glances throughout a stressful, time-pressured day â€” not a dashboard to sit and study. Design for that:

- **Avoid** clinical/medical-app sterility and the generic SaaS rounded-card-with-shadow kit â€” this isn't a symptom tracker for a doctor, it's a personal daily companion.
- **Palette:** calm and low-stimulation as the base (a soft warm neutral, not stark white or black), with **one** confident accent color reserved *only* for "this is happening right now" â€” not used decoratively elsewhere. Avoid color-coding every category differently; that adds visual noise the ADHD brain doesn't need.
- **Type:** one clear, highly legible type family; the current block's name should be the single largest, boldest thing on the screen â€” everything else recedes.
- **Motion:** one deliberate completion animation, nothing else animates on load or scroll. Respect reduced-motion settings.
- **Copy tone:** plain, factual, warm â€” never cheerleader-y, never guilt-inducing. "Skipped" not "Missed âœ—."

---

## 9. Reminder/Notification Technical Notes (read before building)

Because this is client-side only with no backend:

- Notifications will fire reliably **while the app/tab is open, or when installed as a PWA on Android/desktop** (via Service Worker + scheduled timers).
- **iOS Safari** has limited/partial support for PWA push notifications historically â€” verify current support at build time, since this changes across iOS versions. If unsupported, fall back to an **in-app banner + sound** when the app is open, and clearly tell the user in Settings that reliable reminders require the app installed to the home screen and occasionally opened.
- True background push (notification fires even when the app is fully closed and phone is locked, with no app open) generally requires a small backend push service (e.g. web-push + a lightweight server). That is explicitly **out of scope for v1** â€” flagged as a Phase 2 item below, not silently dropped.

---

## 10. Deployment (Vercel)

- Static build (`vite build` â†’ `dist/`)
- `vercel.json`: no serverless functions, no environment variables, no database
- Connect GitHub repo â†’ Vercel auto-deploys on push
- PWA manifest + service worker included in the build so "Add to Home Screen" works immediately on first visit

---

## 11. Acceptance Criteria (v1)

- [ ] App installs to phone home screen and opens full-screen (no browser bar)
- [ ] Today screen shows only current + next block, not the full list
- [ ] Priority card is editable and persists across app restarts
- [ ] Brain-dump FAB is reachable from every screen in one tap
- [ ] Local notification fires at a block's start time while app is installed/open
- [ ] Marking a block Done/Skipped updates the day's progress strip immediately
- [ ] Evening Review's 3 questions save to that day's log
- [ ] Weekly Retro correctly aggregates the last 7 days from localStorage
- [ ] Missing a day pauses (does not zero out) the streak counter
- [ ] Export produces a valid JSON file; import restores it correctly
- [ ] All interactive elements have visible keyboard focus states
- [ ] Works fully offline after first load
- [ ] No network calls to any third-party service anywhere in the app

---

## 12. Future Phases (explicitly not v1)

- **Phase 2:** Optional lightweight backend for true background push notifications (app closed, phone locked)
- **Phase 2:** Optional cloud sync/backup (still no login required â€” e.g. sync via a code, not an account)
- **Phase 2:** AI-assisted task breakdown (would require an API key + likely a thin backend proxy)

---

## 13. User Context (for whoever/whatever builds this)

Single user, 32, full-stack developer, diagnosed ADHD (2026). Currently in a 90-day UAE-job-prep sprint (mornings: Next.js/Django/DSA/system design) with a time-boxed evening side project. Main behavioral failure mode: goal-switching mid-week, forgetting tasks, and losing consistency when routines change (routine has already shifted 3 times this week alone due to office hours changing). The app must tolerate a changing routine gracefully â€” editing routine blocks in Settings should never require deleting and rebuilding history.
