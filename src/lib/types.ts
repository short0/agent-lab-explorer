export type HarnessVariant = "weak" | "robust" | "custom";

export type Permission = "read" | "write" | "network";

export interface HarnessSettings {
  maxIterations: number;
  retryCount: number;
  allowedTools: string[];
  permissions: Permission[];
  failureInjection: boolean;
  sandbox: boolean;
}

export type TraceStepKind =
  | "task"
  | "model_decision"
  | "tool_call"
  | "tool_result"
  | "hook"
  | "retry"
  | "failure"
  | "stop_condition"
  | "final_output";

export interface TraceStep {
  id: string;
  kind: TraceStepKind;
  title: string;
  detail?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
}

export interface PresetVariant {
  harness: HarnessSettings;
  trace: TraceStep[];
  output: string;
  lesson: string;
}

export interface Preset {
  id: string;
  title: string;
  description: string;
  tags: string[];
  task: string;
  availableTools: string[];
  weak: PresetVariant;
  robust: PresetVariant;
  quickActions: QuickAction[];
}

export interface LabState {
  presetId: string | null;
  task: string;
  harness: HarnessVariant;
  settings: HarnessSettings;
  mode: "mocked" | "live";
  notes: string;
  lastRunVariant: HarnessVariant | null;
  lastChange: string | null;
}
