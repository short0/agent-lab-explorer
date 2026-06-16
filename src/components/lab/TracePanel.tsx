import { Play, GitCompare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TraceStepRow } from "./TraceStepRow";
import type { Preset, HarnessVariant, TraceStep } from "@/lib/types";

interface TracePanelProps {
  preset: Preset | null;
  variant: HarnessVariant;
  trace: TraceStep[];
  compare: boolean;
  onToggleCompare: () => void;
  onRun: () => void;
  onExplain: () => void;
  running: boolean;
}

export function TracePanel({
  preset,
  variant,
  trace,
  compare,
  onToggleCompare,
  onRun,
  onExplain,
  running,
}: TracePanelProps) {
  if (!preset) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-border text-muted-foreground">
          <Play className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-base font-semibold">No preset loaded</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Pick a preset on the left to see a realistic execution trace, or start a blank lab and wire up your own.
        </p>
      </div>
    );
  }

  const showTrace = trace.length > 0;
  const otherVariant: HarnessVariant = variant === "weak" ? "robust" : "weak";
  const otherTrace = (variant === "weak" ? preset.robust : preset.weak).trace;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-start gap-3 border-b border-border p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px] uppercase">
              Task
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase">
              {variant} harness
            </Badge>
          </div>
          <p className="mt-1.5 truncate text-sm font-medium text-foreground" title={preset.task}>
            {preset.task}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={onToggleCompare} className="gap-1.5">
            <GitCompare className="h-3.5 w-3.5" />
            {compare ? "Single" : "Compare"}
          </Button>
          <Button variant="outline" size="sm" onClick={onExplain} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Explain
          </Button>
          <Button size="sm" onClick={onRun} disabled={running} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            {running ? "Running…" : "Run"}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {compare ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {variant} (current)
                </h3>
                <ol aria-live="polite" className="space-y-2">
                  {trace.map((s, i) => (
                    <TraceStepRow key={s.id} step={s} index={i} />
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {otherVariant}
                </h3>
                <ol className="space-y-2">
                  {otherTrace.map((s, i) => (
                    <TraceStepRow key={s.id} step={s} index={i} />
                  ))}
                </ol>
              </div>
            </div>
          ) : showTrace ? (
            <ol aria-live="polite" className="space-y-2">
              {trace.map((s, i) => (
                <TraceStepRow key={s.id} step={s} index={i} />
              ))}
            </ol>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">Ready when you are</p>
              <p className="text-xs text-muted-foreground">Press Run to stream the mocked execution trace.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
