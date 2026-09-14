# SPEC_UPGRADE.md — Daily Focus v1.1

Companion spec to `SPEC.md`. This document covers the gap-closing features identified after using v1 against the original paper diary. **Do not treat this as a reason to rebuild the app** — these are additive changes to the existing client-side-only architecture (localStorage, no backend, Vercel static deploy). Same core principles apply: one thing on screen at a time, no shame mechanics, zero setup friction.

Priority order below is deliberate. **P0 items should ship before anything else** — they protect against actual data loss, which matters more than any new feature.

---

## P0 — Data Safety (ship first)

### 1. Automatic weekly backup export
**Problem:** All data lives in `localStorage` only. Clearing browser cache, reinstalling the browser, or switching phones wipes the entire diary replacement with zero warning.

**Behavior:**
- Every Sunday (or on the 7th day since last export), automatically trigger a JSON download of the full data blob — don't wait for the user to remember.
- Also show a small non-blocking banner: "Backup downloaded — check your Downloads folder" so it's not silent.
- Add a manual "Export now" button in Settings as well (already exists — keep it, this supplements it).
- Track `lastAutoExportDate` in the data blob to know when the next auto-export is due.

**Acceptance criteria:**
- [ ] App checks on load whether 7+ days have passed since last export; if so, triggers download automatically
- [ ] Banner confirms the download happened
- [ ] Manual export still available and unchanged

### 2. Missed-block auto-resolution
**Problem:** No defined behavior when a block's end time passes with no Done/Skip tap. Blocks could sit as "pending" indefinitely, corrupting the day's progress data and the weekly pattern view.

**Behavior:**
- If a block's end time + 30 minute grace period passes with no action taken, auto-mark it `skipped` with a flag `autoResolved: true` (so it's distinguishable in logs from a manually-tapped skip, in case that distinction ever matters later).
- This resolution should happen client-side whenever the app is opened (check all of today's/yesterday's blocks on load), since there's no backend to run it on a schedule.

**Data model change:**
```ts
type BlockStatus = "done" | "skipped" | "pending";
// add:
type BlockLogEntry = {
  status: BlockStatus;
  autoResolved?: boolean;
};
```

**Acceptance criteria:**
- [ ] Opening the app after a block's grace period has passed correctly marks it skipped
- [ ] Weekly Retro correctly counts auto-resolved skips the same as manual skips
- [ ] No block can remain "pending" once its day has ended

---

## P1 — Core Gaps vs. the Diary (ship next)

### 3. Day-of-week routine sets
**Problem:** The diary had different blocks for Friday vs. Saturday. The app currently implies a single fixed routine, requiring manual re-editing every time the schedule shifts (it's already shifted 3 times in one week).

**Behavior:**
- Settings supports named routine sets (e.g. "Weekday," "Saturday," "Sunday").
- Each day of the week maps to a routine set.
- Today screen loads whichever routine set is mapped to the current day, automatically.
- Editing a routine set does not affect past logged history (blocks are logged by name/id + date, not by live reference to the routine set).

**Acceptance criteria:**
- [ ] User can create/name multiple routine sets
- [ ] User can assign a routine set to each day of the week
- [ ] Today screen always reflects the correct set for the current day with no manual switching
- [ ] Past daily logs remain unchanged when a routine set is edited later

### 4. Quick "copy routine forward"
**Problem:** When reality changes (e.g. office hours shift), the user currently has to manually re-enter every block time.

**Behavior:**
- In Settings, a "Copy today's routine forward" action applies the current routine set's block times to all future days using that same set, from tomorrow onward — a fast alternative to editing each block individually when the whole day's shape has moved (e.g. everything shifts 30 minutes later).

**Acceptance criteria:**
- [ ] One tap updates the relevant routine set going forward
- [ ] Does not retroactively change past logged days

### 5. Roadmap view (2-week sprint tracker)
**Problem:** The Today screen deliberately hides everything except right-now, which is correct for daily use — but it also means the multi-week curriculum plan (React → Next.js → Django → DSA → System Design → AI Learn, ~7 two-week sprints) has nowhere to live and risks getting lost entirely.

**Behavior:**
- New screen (not the home screen — reachable via Settings or a secondary tab), showing:
  - A simple ordered list of sprints (name + duration, e.g. "2 weeks → Next.js Full Stack Project")
  - Current sprint highlighted
  - Start date of current sprint + days remaining
  - Tap a sprint to mark it complete / add a one-line note on how it went
- This screen is meant for a weekly glance, not daily — it should not appear anywhere in the main Today flow, to preserve the single-focus principle.

**Data model addition:**
```ts
type Sprint = {
  id: string;
  name: string;
  durationWeeks: number;
  startDate: string | null; // null until started
  status: "upcoming" | "active" | "done";
  note?: string;
};
```

**Acceptance criteria:**
- [ ] Sprints are listed in order with current one visually distinct
- [ ] Marking a sprint done moves to the next automatically (sets its startDate)
- [ ] This view is not part of the default Today screen navigation flow

### 6. Undo on Done/Skip
**Problem:** A single mistaken tap (plausible mid-task-switch) currently has no quick correction path.

**Behavior:**
- After tapping Done or Skip, show a 5-second toast: "Marked done — Undo?"
- Tapping Undo reverts the block to `pending` and cancels any streak/progress update tied to that action.

**Acceptance criteria:**
- [ ] Undo toast appears after every Done/Skip action
- [ ] Undo correctly reverts block status and any dependent streak/progress state
- [ ] Toast auto-dismisses after 5 seconds with no lingering UI

### 7. Free-form daily notes field
**Problem:** The Evening Review's structured 3 questions + 5 friction chips can't hold what a diary naturally holds — stray thoughts, half-formed feelings, anything that doesn't fit a chip.

**Behavior:**
- Add one optional, collapsed-by-default text box at the bottom of Evening Review: "Anything else?"
- Fully skippable — no validation, no character minimum, no prompt to fill it if left blank.
- Saved as `notes: string` on that day's `DailyLog`.

**Acceptance criteria:**
- [ ] Field is collapsed by default and does not add visual weight to the review flow
- [ ] Leaving it blank has no effect on save/submit
- [ ] Saved notes are visible if the user revisits a past day's log (if that view exists) or at minimum included in the "Copy Analysis for Claude" export

---

## P2 — Nice-to-Have (later pass, not urgent)

### 8. Lightweight financial check-in
**Problem:** Financial discipline was one of the original stated struggles, currently untouched by the app.

**Behavior — deliberately minimal, resist scope creep:**
- One optional field in Evening Review: "Did today match your spending plan?" — Yes / No toggle, nothing more.
- No categories, no amounts, no budgeting logic. If this needs more than a single toggle, it belongs in a separate dedicated tool, not bolted onto this app's scope.

**Acceptance criteria:**
- [ ] Single toggle only, fully optional
- [ ] No new screens or navigation added for this feature

### 9. Colorblind-safe progress indicators
**Problem:** Progress strip and weekly pattern grid currently rely on color (e.g. amber = done) which is insufficient for colorblind accessibility.

**Behavior:**
- Pair every color-coded status with a distinct shape or fill pattern (e.g. solid circle = done, outlined circle = skipped, empty = pending) so status is legible without color.

**Acceptance criteria:**
- [ ] No status in the app is conveyed by color alone
- [ ] Verified against at least one colorblindness simulation (protanopia/deuteranopia)

---

## Explicit Non-Goals for v1.1

- No cloud sync or account system (still local-only; weekly auto-export is the backup strategy, not sync)
- No true background push notifications (still requires a backend — unchanged from SPEC.md §9)
- No expansion of the financial check-in beyond the single toggle above
- No redesign of the core Today screen's single-focus layout — all additions here live in secondary screens (Settings, Roadmap, Evening Review) so the home screen stays exactly as minimal as it is today

---

## Suggested Build Order

1. P0 #1 (auto-backup) and #2 (missed-block resolution) — data integrity first
2. P1 #3 (day-of-week routines) and #4 (copy forward) — since the schedule is already actively changing
3. P1 #6 (undo) — small, low-risk, high value
4. P1 #5 (roadmap view) and #7 (notes field) — round out the diary replacement
5. P2 items whenever there's spare capacity — not before the above