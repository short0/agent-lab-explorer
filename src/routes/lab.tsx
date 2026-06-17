import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { ControlsPanel } from "@/components/lab/ControlsPanel";
import { TracePanel } from "@/components/lab/TracePanel";
import { OutputPanel } from "@/components/lab/OutputPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLabState } from "@/hooks/useLabState";
import { PRESETS_BY_ID } from "@/data/presets";
import type { HarnessVariant, TraceStep, HarnessSettings } from "@/lib/types";

interface LabSearch {
  preset?: string;
}

export const Route = createFileRoute("/lab")({
  validateSearch: (s: Record<string, unknown>): LabSearch => ({
    preset: typeof s.preset === "string" ? s.preset : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lab — Agent Harness Lab" },
      { name: "description", content: "Interactive sandbox for AI agent harnesses." },
    ],
  }),
  component: LabPage,
});

function applyQuickAction(actionId: string, settings: HarnessSettings): { next: HarnessSettings; label: string } {
  const next = { ...settings, allowedTools: [...settings.allowedTools], permissions: [...settings.permissions] };
  switch (actionId) {
    case "break-sandbox":
      next.sandbox = false;
      return { next, label: "Disabled sandbox" };
    case "inject-failure":
      next.failureInjection = true;
      return { next, label: "Enabled failure injection" };
    case "allow-network":
      if (!next.permissions.includes("network")) next.permissions.push("network");
      return { next, label: "Granted network permission" };
    case "lower-iters":
      next.maxIterations = 2;
      return { next, label: "Max iterations set to 2" };
    case "tighter-iters":
      next.maxIterations = 3;
      return { next, label: "Max iterations set to 3" };
    case "raise-iters":
      next.maxIterations = 20;
      return { next, label: "Max iterations raised to 20" };
    case "tighter-retries":
      next.retryCount = 0;
      return { next, label: "Retries set to 0" };
    case "no-write":
      next.permissions = next.permissions.filter((p) => p !== "write");
      return { next, label: "Removed write permission" };
    case "no-memory":
    case "drop-cite":
    case "drop-escalation":
    case "drop-validator":
    case "add-novelty":
    case "wider-tools":
    case "drop-email":
      return { next, label: `Applied: ${actionId}` };
    default:
      return { next, label: `Applied: ${actionId}` };
  }
}

function LabPage() {
  const search = Route.useSearch();
  const { state, update, undo, redo, reset, loadPreset, canUndo, canRedo } = useLabState(search.preset ?? null);
  const loadedFromSearch = useRef<string | null>(search.preset ?? null);

  // Allow subsequent URL changes (e.g. clicking another preset link) to re-load
  useEffect(() => {
    if (search.preset && search.preset !== loadedFromSearch.current && PRESETS_BY_ID[search.preset]) {
      loadedFromSearch.current = search.preset;
      loadPreset(search.preset, "robust");
    }
  }, [search.preset, loadPreset]);

  const preset = state.presetId ? PRESETS_BY_ID[state.presetId] ?? null : null;

  // Determine displayed trace/output/lesson based on harness variant
  const variant: HarnessVariant = state.harness === "weak" ? "weak" : "robust";
  const presetVariant = preset ? (variant === "weak" ? preset.weak : preset.robust) : null;

  const [running, setRunning] = useState(false);
  const [streamed, setStreamed] = useState<TraceStep[]>([]);
  const [explainOpen, setExplainOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  const [mobileTab, setMobileTab] = useState("controls");
  const runTimer = useRef<number | null>(null);

  // Reset streamed trace when preset / variant changes
  useEffect(() => {
    setStreamed([]);
    setExplainOpen(false);
  }, [state.presetId, state.harness]);

  useEffect(() => () => {
    if (runTimer.current) window.clearTimeout(runTimer.current);
  }, []);

  const runMock = () => {
    if (!presetVariant) return;
    setRunning(true);
    setStreamed([]);
    const steps = presetVariant.trace;
    let i = 0;
    const tick = () => {
      i += 1;
      setStreamed(steps.slice(0, i));
      if (i < steps.length) {
        runTimer.current = window.setTimeout(tick, 280) as unknown as number;
      } else {
        setRunning(false);
      }
    };
    runTimer.current = window.setTimeout(tick, 200) as unknown as number;
  };

  const displayedTrace = useMemo(() => streamed, [streamed]);
  const showFinal = !running && streamed.length > 0 && presetVariant;
  const output = showFinal ? presetVariant!.output : "";
  const lesson = explainOpen && presetVariant ? presetVariant.lesson : "";

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <TopBar
        mode={state.mode}
        onUndo={undo}
        onRedo={redo}
        onReset={() => {
          reset();
          loadedFromSearch.current = null;
        }}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Desktop: 3-panel grid */}
      <main className="hidden flex-1 lg:grid lg:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside className="border-r border-border overflow-y-auto">
          <ControlsPanel
            state={state}
            preset={preset}
            onLoadPreset={(id, v) => loadPreset(id, v ?? "robust")}
            onClearPreset={() =>
              update(
                (s) => ({ ...s, presetId: null, task: "", settings: { ...s.settings, allowedTools: [] } }),
                "Cleared preset",
              )
            }
            onTaskChange={(t) => update((s) => ({ ...s, task: t }), "Edited task")}
            onHarnessChange={(v) => {
              if (preset && v !== "custom") {
                const pv = v === "weak" ? preset.weak : preset.robust;
                update(
                  (s) => ({ ...s, harness: v, settings: pv.harness }),
                  `Harness: ${v}`,
                );
              } else {
                update((s) => ({ ...s, harness: v }), `Harness: ${v}`);
              }
            }}
            onSettingsChange={(s2, label) =>
              update((s) => ({ ...s, settings: s2, harness: "custom" }), label)
            }
            onModeChange={(m) => update((s) => ({ ...s, mode: m }), `Mode: ${m}`)}
            onQuickAction={(actionId) => {
              const { next, label } = applyQuickAction(actionId, state.settings);
              update((s) => ({ ...s, settings: next, harness: "custom" }), label);
            }}
          />
        </aside>
        <section className="overflow-hidden border-r border-border">
          <TracePanel
            preset={preset}
            variant={variant}
            trace={displayedTrace}
            compare={compare && !!preset}
            onToggleCompare={() => setCompare((c) => !c)}
            onRun={runMock}
            onExplain={() => setExplainOpen(true)}
            running={running}
          />
        </section>
        <aside className="overflow-hidden">
          <OutputPanel
            state={state}
            preset={preset}
            variant={variant}
            output={output}
            lesson={lesson}
            onNotesChange={(n) => update((s) => ({ ...s, notes: n }), "Edited notes")}
          />
        </aside>
      </main>

      {/* Mobile / tablet: tabs */}
      <main className="flex flex-1 flex-col lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex flex-1 flex-col">
          <div className="sticky top-14 z-30 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
            <TabsList className="w-full">
              <TabsTrigger value="controls" className="flex-1">
                Controls
              </TabsTrigger>
              <TabsTrigger value="trace" className="flex-1">
                Trace
              </TabsTrigger>
              <TabsTrigger value="output" className="flex-1">
                Output
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="controls" className="mt-0 flex-1">
            <ControlsPanel
              state={state}
              preset={preset}
              onLoadPreset={(id, v) => loadPreset(id, v ?? "robust")}
              onClearPreset={() =>
                update((s) => ({ ...s, presetId: null, task: "" }), "Cleared preset")
              }
              onTaskChange={(t) => update((s) => ({ ...s, task: t }), "Edited task")}
              onHarnessChange={(v) => {
                if (preset && v !== "custom") {
                  const pv = v === "weak" ? preset.weak : preset.robust;
                  update((s) => ({ ...s, harness: v, settings: pv.harness }), `Harness: ${v}`);
                } else {
                  update((s) => ({ ...s, harness: v }), `Harness: ${v}`);
                }
              }}
              onSettingsChange={(s2, label) =>
                update((s) => ({ ...s, settings: s2, harness: "custom" }), label)
              }
              onModeChange={(m) => update((s) => ({ ...s, mode: m }), `Mode: ${m}`)}
              onQuickAction={(actionId) => {
                const { next, label } = applyQuickAction(actionId, state.settings);
                update((s) => ({ ...s, settings: next, harness: "custom" }), label);
                setMobileTab("trace");
              }}
            />
          </TabsContent>
          <TabsContent value="trace" className="mt-0 flex-1">
            <TracePanel
              preset={preset}
              variant={variant}
              trace={displayedTrace}
              compare={compare && !!preset}
              onToggleCompare={() => setCompare((c) => !c)}
              onRun={() => {
                runMock();
              }}
              onExplain={() => {
                setExplainOpen(true);
                setMobileTab("output");
              }}
              running={running}
            />
          </TabsContent>
          <TabsContent value="output" className="mt-0 flex-1">
            <OutputPanel
              state={state}
              preset={preset}
              variant={variant}
              output={output}
              lesson={lesson}
              onNotesChange={(n) => update((s) => ({ ...s, notes: n }), "Edited notes")}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
