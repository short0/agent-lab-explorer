import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GLOSSARY } from "@/data/glossary";
import type { LabState, Preset, HarnessVariant } from "@/lib/types";

interface OutputPanelProps {
  state: LabState;
  preset: Preset | null;
  variant: HarnessVariant;
  output: string;
  lesson: string;
  onNotesChange: (notes: string) => void;
}

export function OutputPanel({
  state,
  preset,
  variant,
  output,
  lesson,
  onNotesChange,
}: OutputPanelProps) {
  const s = state.settings;
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="output" className="flex h-full flex-col">
        <div className="border-b border-border px-3 pt-3">
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="lesson">Lesson</TabsTrigger>
            <TabsTrigger value="harness">Harness</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="output" className="mt-0 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                  Output
                </Badge>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {variant}
                </Badge>
              </div>
              {output ? (
                <pre className="whitespace-pre-wrap break-words rounded-md border border-border bg-card p-3 text-sm leading-relaxed">
                  {output}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Run the agent to see its final response here.
                </p>
              )}
              {state.lastChange && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Last change:</span> {state.lastChange}
                </p>
              )}
            </TabsContent>

            <TabsContent value="lesson" className="mt-0 space-y-3">
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                Lesson
              </Badge>
              {lesson ? (
                <p className="text-sm leading-relaxed text-foreground">{lesson}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pick a preset and press <em>Explain</em> to see why the harness helped or failed.
                </p>
              )}
            </TabsContent>

            <TabsContent value="harness" className="mt-0 space-y-3">
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                Harness config
              </Badge>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Max iterations</dt>
                <dd className="font-mono">{s.maxIterations}</dd>
                <dt className="text-muted-foreground">Retry budget</dt>
                <dd className="font-mono">{s.retryCount}</dd>
                <dt className="text-muted-foreground">Sandbox</dt>
                <dd className="font-mono">{s.sandbox ? "on" : "off"}</dd>
                <dt className="text-muted-foreground">Failure injection</dt>
                <dd className="font-mono">{s.failureInjection ? "on" : "off"}</dd>
                <dt className="text-muted-foreground">Permissions</dt>
                <dd className="font-mono">{s.permissions.join(", ") || "none"}</dd>
                <dt className="text-muted-foreground">Allowed tools</dt>
                <dd className="font-mono break-words">
                  {s.allowedTools.length ? s.allowedTools.join(", ") : "none"}
                </dd>
              </dl>
              {preset && (
                <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Preset:</span> {preset.title} —{" "}
                  {preset.description}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-0 space-y-3">
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                Notes
              </Badge>
              <Textarea
                value={state.notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={10}
                placeholder="Jot what you tried, what changed, what you'd test next…"
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">Saved automatically to this browser.</p>
            </TabsContent>

            <TabsContent value="glossary" className="mt-0 space-y-3">
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                Glossary
              </Badge>
              <dl className="space-y-3">
                {GLOSSARY.map((g) => (
                  <div key={g.term}>
                    <dt className="text-sm font-medium text-foreground">{g.term}</dt>
                    <dd className="mt-0.5 text-sm text-muted-foreground">{g.short}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
