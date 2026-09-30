# NEW_SPEC — the minimal version

> One idea: **"What's the one thing right now?"**
> Everything else is noise and gets cut.

---

## 1. Why a rewrite

Right now the app has 11 screens, 5 bottom tabs, and about 25 data types. It has coins, a rewards store, badges, streaks, habit timers, learning sprints, a dream assessment, A/B/C priorities, weekday routine sets, subtasks, an evening review with 6 questions, weekly charts, an AI export and a profile.

For an ADHD brain, every extra button is one more decision. Every decision spends the same small energy tank we need for the actual task. The app became a second job.

**Rule for the new version:** a feature stays only if it helps you **start**, **keep going**, or **not forget**. Anything that only *measures*, *plans far ahead*, or *decorates* is cut.

---

## 2. ADHD principles the app is built on

These are widely documented ADHD coping strategies. The linked Reddit post could not be fetched, so these are well-known principles, not quotes from that post.

| # | Principle | What it means in the app |
|---|-----------|--------------------------|
| 1 | **Starting is the hardest part** (task initiation) | Every task shows a *tiny first step* and a big **Start** button |
| 2 | **Out of sight = out of mind** | The current task is huge and always on screen. No hidden drawers |
| 3 | **Your head is not a storage device** | Capture anything in about 2 seconds, from anywhere |
| 4 | **Time blindness** | Time is shown *visually*: a shrinking ring, not just numbers |
| 5 | **Decision fatigue** | Max **3** things for today. No priority levels, no categories |
| 6 | **Interest > importance** | "Just 10 minutes" framing. Permission to stop after the timer |
| 7 | **Instant reward beats future reward** | A small celebration the *moment* you finish. No points to manage |
| 8 | **Shame kills momentum** | No streaks to break, no red "missed" counters. Undone items quietly roll over |
| 9 | **Body doubling helps** | The timer screen feels like "working together", with a friendly mascot and a gentle message |
| 10 | **Less choice, fixed places** | Same layout every day. One screen does one job |

---

## 3. The whole app: 2 screens + 1 overlay

```
┌──────────────┐     ┌──────────────┐
│     NOW      │ ⇄   │     DUMP     │
│  (home)      │     │  (inbox)     │
└──────┬───────┘     └──────────────┘
       │ Start
       ▼
┌──────────────┐
│ FOCUS overlay│  (full-screen timer)
└──────────────┘
```

Bottom nav: **Now** and **Dump**, 2 tabs only. Settings is a small gear icon on Now.

---

### Screen A — NOW (home)

Top to bottom:

1. **Greeting line.** "Hi {name}. One thing at a time." Small text, no stats.
2. **The ONE card** (big, honey-yellow):
   - Task text (large)
   - "First step:" + tiny step, e.g. *"Open the laptop"* (optional, editable)
   - Big orange **▶ Start 10 min** button
   - A small **✓ Done** button
3. **Up next** (max 2 more items, small rows). Tap one to make it the ONE.
4. If the list is empty, a friendly empty state: *"Nothing planned. Pick one thing from Dump →"*.
5. **Done today** (collapsed line): "✓ 3 done today". Tap to see the list. This is a *done list*, not a to-do list; it proves you did things.

Rules:
- Today is capped at **3 items**. When you try to add a 4th: *"Today is full. Park it in Dump?"*
- At midnight, unfinished items **stay** (roll over silently). No "overdue" label.

---

### Screen B — DUMP (capture everything)

1. One input at the top: *"What's on your mind?"*. Enter saves. Nothing else to fill in.
2. A plain list of everything dumped, newest first.
3. Each row has 2 actions only:
   - **→ Today** (moves it to Now, respecting the max of 3)
   - **🗑** (delete, with a 5-second undo toast)
4. No tags, no filters, no categories.

A floating **+** button on *both* screens opens the same quick-capture sheet, so a thought never waits.

---

### Overlay — FOCUS (timer)

1. Task name at the top + "First step: …"
2. A big shrinking ring showing time left (visual time).
3. Mascot + one gentle line ("I'm here with you.", "Just this one thing.").
4. Buttons: **Pause** and **I'm done**.
5. Presets: **10 / 25 min**. The default is 10, because a short timer is easier to agree to.
6. When the timer ends:
   - Soft chime + *"Nice. Keep going or stop?"*
   - **Keep going (+10)**, **Done ✓** or **Stop for now**. All three are okay; none is a failure.
7. On **Done**: a 1-second confetti + "Done! 🎉" and back to Now. The next item becomes the ONE.

---

### Settings (small sheet, not a tab)

- Your name
- Default focus length (10 / 25)
- Sound on/off
- Theme (light / dark / system)
- Export / import data (JSON file)
- Reset all data

That's all.

---

## 4. Data model (all of it)

```ts
type Item = {
  id: string;
  text: string;
  firstStep?: string;
  list: 'today' | 'dump';
  done: boolean;
  doneAt?: string;   // ISO date-time
  createdAt: string;
};

type AppData = {
  items: Item[];
  settings: {
    name: string;
    focusMinutes: 10 | 25;
    sound: boolean;
    theme: 'light' | 'dark' | 'system';
  };
};
```

Stored in `localStorage` under one key. Nothing leaves the device.

---

## 5. What happens to current features

| Current feature | Decision | Why |
|---|---|---|
| Today screen (hero, coins, tabs, tickets) | **Simplify → NOW** | Keep the look; drop coins and tabs |
| Brain Dump / Inbox (tags, filters, 3 modes) | **Simplify → DUMP** | Keep capture; drop tags, filters and modes |
| Brain Dump FAB + modal | **Keep** | Instant capture is core |
| Pomodoro / Focus timer | **Simplify → FOCUS overlay** | Keep the ring and mascot; drop stats and long break |
| Task Completed celebration | **Simplify** | Short and instant; no coin amount |
| Settings | **Shrink** | 6 options only |
| Coins, Rewards Store, Profile, Badges | **Cut** | A points economy is extra bookkeeping |
| Streaks | **Cut** | A broken streak = shame = you quit the app |
| Habit Breaker (timers, milestones, SOS) | **Cut** | A separate app/problem; add back later only if missed |
| Learning Roadmap, Sprints, Dream Assessment | **Cut** | Long-term planning; a to-do in Dump is enough |
| Routine blocks, routine sets, weekday schedule, subtasks | **Cut** | Too rigid; one "first step" replaces subtasks |
| Day Schedule screen | **Cut** | Same as above |
| A/B/C priorities, habit/goal categories, colour themes | **Cut** | A max of 3 already forces priority |
| Evening Review (mood, why-slipped, spending) | **Cut** | The "Done today" list gives the same reflection with no effort |
| Weekly Progress charts | **Cut** | Measuring ≠ doing |
| AI export, notifications, auto-resolve | **Cut** | Not needed for the core loop |
| More hub | **Cut** | Only 2 tabs, nothing to hide |

---

## 6. Design rules

- Keep the current warm cream + orange + honey style and the mascot art. It is calm and friendly.
- **One primary button per screen** (orange). Everything else is small or plain.
- Big text for the ONE task (≥ 22px). Tap targets ≥ 44px.
- No red, no warnings, no counts of what you *didn't* do.
- Every message is kind: "Stop for now" instead of "Give up", "Rolls to tomorrow" instead of "Overdue".
- Animations are short (< 400ms) and never block you.
- Works offline, as a PWA, phone-first.

---

## 7. Build plan (small steps)

1. Create the new `AppData` + storage with a migration that turns old open todos and brain-dump items into `Item`s.
2. Build **NOW** from the current Today screen: remove coins, tabs and schedule.
3. Build **DUMP** from the current Inbox: remove tags, filters and modes.
4. Turn the Pomodoro screen into the **FOCUS** overlay.
5. Shrink Settings.
6. Delete unused screens, components and types. Then `npm run build` + `npm run lint`.

**Done means:** you open the app, see one thing, press Start, and nothing else asks for your attention.
