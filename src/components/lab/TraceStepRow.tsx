import {
  Wrench,
  Brain,
  PlayCircle,
  AlertTriangle,
  RotateCw,
  StopCircle,
  CheckCircle2,
  Sparkles,
  ListChecks,
} from "lucide-react";
import type { TraceStep, TraceStepKind } from "@/lib/types";

const META: Record<TraceStepKind, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  task: { label: "Task", icon: ListChecks },
  model_decision: { label: "Model", icon: Brain },
  tool_call: { label: "Tool", icon: Wrench },
  tool_result: { label: "Result", icon: PlayCircle },
  hook: { label: "Hook", icon: Sparkles },
  retry: { label: "Retry", icon: RotateCw },
  failure: { label: "Failure", icon: AlertTriangle },
  stop_condition: { label: "Stop", icon: StopCircle },
  final_output: { label: "Output", icon: CheckCircle2 },
};

const TONE_CLASS: Record<NonNullable<TraceStep["tone"]>, string> = {
  neutral: "border-border bg-card",
  good: "border-emerald-500/30 bg-emerald-500/5",
  warn: "border-amber-500/30 bg-amber-500/5",
  bad: "border-red-500/30 bg-red-500/5",
};

export function TraceStepRow({ step, index }: { step: TraceStep; index: number }) {
  const m = META[step.kind];
  const Icon = m.icon;
  const tone = step.tone ?? "neutral";
  return (
    <li className={`rounded-lg border p-3 transition-colors ${TONE_CLASS[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {String(index + 1).padStart(2, "0")} · {m.label}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-foreground">{step.title}</p>
          {step.detail ? (
            <pre className="mt-1.5 overflow-x-auto rounded-md bg-muted/60 p-2 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
              {step.detail}
            </pre>
          ) : null}
        </div>
      </div>
    </li>
  );
}
