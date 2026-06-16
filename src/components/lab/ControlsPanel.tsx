import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, FileX2 } from "lucide-react";
import { PRESETS } from "@/data/presets";
import type { LabState, Preset, HarnessVariant, Permission } from "@/lib/types";

interface ControlsPanelProps {
  state: LabState;
  preset: Preset | null;
  onLoadPreset: (id: string, variant?: HarnessVariant) => void;
  onClearPreset: () => void;
  onTaskChange: (task: string) => void;
  onHarnessChange: (v: HarnessVariant) => void;
  onSettingsChange: (s: LabState["settings"], label: string) => void;
  onModeChange: (m: "mocked" | "live") => void;
  onQuickAction: (actionId: string) => void;
}

const ALL_PERMISSIONS: Permission[] = ["read", "write", "network"];

export function ControlsPanel({
  state,
  preset,
  onLoadPreset,
  onClearPreset,
  onTaskChange,
  onHarnessChange,
  onSettingsChange,
  onModeChange,
  onQuickAction,
}: ControlsPanelProps) {
  const taskId = useId();
  const settings = state.settings;
  const availableTools = preset?.availableTools ?? [];

  const togglePermission = (p: Permission) => {
    const next = settings.permissions.includes(p)
      ? settings.permissions.filter((x) => x !== p)
      : [...settings.permissions, p];
    onSettingsChange({ ...settings, permissions: next }, `Permissions: ${next.join(", ") || "none"}`);
  };

  const toggleTool = (t: string) => {
    const next = settings.allowedTools.includes(t)
      ? settings.allowedTools.filter((x) => x !== t)
      : [...settings.allowedTools, t];
    onSettingsChange({ ...settings, allowedTools: next }, `Allowed tools updated`);
  };

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preset</Label>
        <div className="flex gap-2">
          <Select
            value={state.presetId ?? ""}
            onValueChange={(v) => onLoadPreset(v, state.harness)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Pick a preset…" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.presetId && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Clear preset"
              onClick={onClearPreset}
            >
              <FileX2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={taskId} className="text-xs uppercase tracking-wider text-muted-foreground">
          Task
        </Label>
        <Textarea
          id={taskId}
          value={state.task}
          placeholder="Describe what the agent should do…"
          onChange={(e) => onTaskChange(e.target.value)}
          rows={4}
          className="resize-none text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Harness</Label>
        <div className="grid grid-cols-3 gap-1.5 rounded-md border border-border bg-muted/40 p-1">
          {(["weak", "robust", "custom"] as HarnessVariant[]).map((v) => (
            <button
              key={v}
              onClick={() => onHarnessChange(v)}
              className={`rounded px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                state.harness === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mode</Label>
        <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {state.mode === "live" ? "Live LLM" : "Simulated"}
            </p>
            <p className="text-xs text-muted-foreground">
              {state.mode === "live"
                ? "Real model calls (coming soon)."
                : "Deterministic mocked runs."}
            </p>
          </div>
          <Switch
            checked={state.mode === "live"}
            onCheckedChange={(c) => onModeChange(c ? "live" : "mocked")}
            disabled
            aria-label="Toggle live mode (coming soon)"
          />
        </div>
      </div>

      {preset && preset.quickActions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Quick actions
          </Label>
          <div className="grid gap-1.5">
            {preset.quickActions.map((a) => (
              <button
                key={a.id}
                onClick={() => onQuickAction(a.id)}
                className="group rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:border-foreground/20 hover:bg-accent"
              >
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          Settings
          <ChevronDown className="h-3.5 w-3.5 transition-transform data-[state=closed]:-rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Max iterations</Label>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {settings.maxIterations}
              </Badge>
            </div>
            <Slider
              className="mt-2"
              value={[settings.maxIterations]}
              min={1}
              max={20}
              step={1}
              onValueChange={([v]) =>
                onSettingsChange({ ...settings, maxIterations: v }, `Max iterations: ${v}`)
              }
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Retry budget</Label>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {settings.retryCount}
              </Badge>
            </div>
            <Slider
              className="mt-2"
              value={[settings.retryCount]}
              min={0}
              max={5}
              step={1}
              onValueChange={([v]) =>
                onSettingsChange({ ...settings, retryCount: v }, `Retries: ${v}`)
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Permissions</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PERMISSIONS.map((p) => {
                const on = settings.permissions.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePermission(p)}
                    className={`rounded-full border px-2.5 py-1 text-xs capitalize transition-colors ${
                      on
                        ? "border-foreground/30 bg-foreground/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {availableTools.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Allowed tools</Label>
              <div className="space-y-1.5">
                {availableTools.map((t) => {
                  const id = `tool-${t}`;
                  const checked = settings.allowedTools.includes(t);
                  return (
                    <div key={t} className="flex items-center gap-2">
                      <Checkbox id={id} checked={checked} onCheckedChange={() => toggleTool(t)} />
                      <label htmlFor={id} className="cursor-pointer font-mono text-xs text-foreground">
                        {t}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border border-border p-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium">Sandbox</p>
              <p className="text-[11px] text-muted-foreground">Isolate filesystem and code execution.</p>
            </div>
            <Switch
              checked={settings.sandbox}
              onCheckedChange={(c) =>
                onSettingsChange({ ...settings, sandbox: c }, `Sandbox ${c ? "on" : "off"}`)
              }
              aria-label="Toggle sandbox"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium">Failure injection</p>
              <p className="text-[11px] text-muted-foreground">Force a tool to fail on the first call.</p>
            </div>
            <Switch
              checked={settings.failureInjection}
              onCheckedChange={(c) =>
                onSettingsChange({ ...settings, failureInjection: c }, `Failure injection ${c ? "on" : "off"}`)
              }
              aria-label="Toggle failure injection"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
