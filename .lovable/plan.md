
# Agent Harness Lab — Build Plan

A single-page, fully responsive web app that teaches how AI agent harnesses work (tools, permissions, memory, hooks, traces, retries, stop conditions, failure handling) through a mocked, interactive lab.

## Scope & defaults
- No authentication. All state in `localStorage`.
- Mocked runs are the default and the most polished experience.
- Live LLM mode is out of scope for v1 (placeholder toggle only, disabled with tooltip "coming soon"). Keeps the app fully functional and avoids backend setup unless you want it.
- Single SPA, no database, no Lovable Cloud.

## Information architecture

Two routes:
- `/` — Home
- `/lab` — Lab (preset loaded via `?preset=<id>` or blank)

Shared: top bar with logo, theme toggle, "Reset" (clears lab state), help link.

### Home screen
- Hero: one-sentence definition of an agent harness + 2-line plain-language explainer.
- Primary CTA: "Open blank lab". Secondary: "Pick a preset below".
- Preset grid (cards): title, 1-line description, tags (e.g. `tools`, `retries`, `sandbox`), "Open" button.
- "How it works" — 4 short blocks: Task → Harness → Trace → Output/Lesson.
- Footer: concept glossary link (opens in lab right panel).

### Lab screen — 3 panels (desktop), stacked tabs (mobile)
**Left — Controls**
- Preset selector (dropdown + "Load")
- Task input (textarea, editable)
- Harness selector: `Weak` | `Robust` | `Custom`
- Mode toggle: `Mocked` (default) / `Live` (disabled badge)
- Settings (collapsible): max iterations, retry count, allowed tools (checkbox list), permissions (read/write/network), failure injection toggle, sandbox on/off
- Quick actions (preset-specific 3–5 buttons)

**Center — Execution trace**
- Header: task summary, harness badge, run/stop buttons
- Timeline of steps with typed entries: `task`, `model_decision`, `tool_call`, `tool_result`, `hook`, `retry`, `failure`, `stop_condition`, `final_output`
- Each entry: icon, label chip, collapsible details, timestamp (mock)
- "Explain this run" button → populates right panel lesson
- "Compare weak vs robust" toggle → splits center into two synced columns

**Right — Output & lesson**
- Tabs: `Output` | `Lesson` | `Harness` | `What changed` | `Glossary`
- Output: final mocked agent response (markdown-ish)
- Lesson: why this harness helped or failed (preset-specific)
- Harness: structured view of current config
- What changed: diff vs last run (settings/harness changes)
- Notes: free-form textarea, persisted

## Presets (5)
Each defined as a typed object in `src/data/presets.ts` with: id, title, description, tags, task, harnessConfig, traceSteps[], finalOutput, lesson, quickActions[].

1. **coding-sandbox** — Coding agent in a sandbox; runs code via mock `exec`, blocks network, retries on syntax error.
2. **research-web** — Research agent with `web_search` + `fetch_url` tools, memory of sources, citation hook.
3. **support-escalation** — Support agent with `lookup_order`, escalation hook fires when sentiment < threshold.
4. **data-extraction** — Extract structured JSON from text, Zod-style validator hook, retry on invalid schema.
5. **stuck-loop** — Agent loops calling same tool; max-iteration stop condition triggers and surfaces failure lesson.

Each preset ships a `weak` and `robust` variant for the compare view.

## Undo / Redo / Reset
- Lab state is a single object: `{ presetId, task, harness, settings, traceRunId, notes, mode }`.
- Maintain `past[]`, `present`, `future[]` stacks in a `useLabHistory` hook (cap 50).
- Toolbar buttons: Undo (⌘Z), Redo (⌘⇧Z), Reset (confirm → clears to defaults, navigates `/`).
- Mutations (load preset, edit task, change harness/settings, run) push to history.

## localStorage keys
- `ahl.theme` — `light` | `dark` (default `light`)
- `ahl.mode` — `mocked` | `live`
- `ahl.lastPreset` — preset id
- `ahl.notes` — string
- `ahl.labState` — serialized present state
- `ahl.history` — `{ past, future }` (capped)

Wrapped in a tiny `storage.ts` with try/catch + SSR guard.

## Mock runner
`src/lib/mockRunner.ts` — takes `(preset, harness, settings)` and yields trace steps with small `setTimeout` delays for a "live feel". Deterministic; honors:
- `maxIterations` → emits `stop_condition` when exceeded (drives the stuck-loop preset)
- `failureInjection` → injects a `failure` then either `retry` (robust) or `stop` (weak)
- `allowedTools` / `permissions` → emits `hook: permission_denied` if disallowed
- `sandbox` off → emits a warning hook

## Design system
- Tailwind v4 tokens in `src/styles.css`. Neutral palette (zinc-ish), one subtle accent (muted indigo). Soft shadows, 1px borders, generous spacing (`p-6`/`p-8`), rounded-xl.
- Typography: Inter (load via `<link>` in `__root.tsx`), tight headings, comfortable body line-height.
- Theme: class-based dark mode via `@custom-variant dark (&:where(.dark, .dark *));`. Toggle adds/removes `dark` on `<html>`.
- shadcn components only (Button, Card, Tabs, Dialog, Select, Textarea, Switch, Tooltip, Badge, Separator, ScrollArea, Collapsible). Icon-only buttons get `aria-label`.
- Mocked vs Live: persistent badge in top bar — pill with dot. Mocked = neutral; Live = amber with "simulated off" wording.

## Responsiveness
- Desktop ≥1024px: 3 columns `grid-cols-[280px_minmax(0,1fr)_360px]`.
- Tablet 640–1023px: 2 columns, right panel collapses into a bottom sheet/tabs.
- Mobile <640px: vertical stack with sticky top action bar (Run, Undo, Redo, Panel switcher: Controls/Trace/Output).
- Follow responsive-layout-patterns (min-w-0, shrink-0, truncate).

## Accessibility
- All interactive elements keyboard reachable; visible focus rings via tokens.
- Tap targets ≥44px on mobile.
- One `<main>` per route in root layout.
- Semantic headings, alt text, `aria-live="polite"` on trace stream.

## File plan
```
src/
  routes/
    __root.tsx              (theme provider, top bar, Inter <link>)
    index.tsx               (home)
    lab.tsx                 (lab shell, 3-panel grid)
  components/
    TopBar.tsx, ThemeToggle.tsx, ModeBadge.tsx
    home/HeroSection.tsx, PresetGrid.tsx, HowItWorks.tsx
    lab/ControlsPanel.tsx, TracePanel.tsx, OutputPanel.tsx
    lab/TraceStep.tsx, CompareView.tsx, QuickActions.tsx
    lab/HarnessSettings.tsx, GlossaryDrawer.tsx
    ui/* (shadcn)
  data/
    presets.ts, glossary.ts
  lib/
    mockRunner.ts, storage.ts, history.ts, types.ts, cn.ts
  hooks/
    useTheme.ts, useLabState.ts, useLabHistory.ts, useMockRun.ts
  styles.css
```

## Out of scope (v1)
- Real LLM calls / backend
- Persisting full run history beyond last run
- Account/sharing/export

## Acceptance checklist
- Light default, dark toggle persists across reloads.
- All 5 presets load with prefilled task, trace, output, lesson, quick actions.
- Undo/redo work across task edits, harness/settings changes, preset loads, runs.
- Reset clears lab state and returns to home.
- Mocked mode visually distinct; Live mode toggle present but disabled.
- 3-panel desktop, 2-panel tablet, stacked mobile with sticky actions.
- Keyboard nav + visible focus throughout; icon buttons labeled.
