import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Wrench, ListTree, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRESETS } from "@/data/presets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent Harness Lab — Learn how AI agent harnesses work" },
      {
        name: "description",
        content:
          "An interactive sandbox for learning how AI agent harnesses work — tools, permissions, memory, hooks, traces, retries, and stop conditions.",
      },
      { property: "og:title", content: "Agent Harness Lab" },
      {
        property: "og:description",
        content:
          "Interactive sandbox for learning how AI agent harnesses work. Mocked, hands-on, no setup.",
      },
    ],
  }),
  component: Home,
});

const HOW_IT_WORKS = [
  { icon: BookOpen, title: "Pick a task", body: "Use a preset or write your own. The task is what the agent will try to do." },
  { icon: Wrench, title: "Set the harness", body: "Choose tools, permissions, retries, stop conditions, and whether to sandbox." },
  { icon: ListTree, title: "Watch the trace", body: "See each decision, tool call, hook, retry, and failure as it happens." },
  { icon: Sparkles, title: "Read the lesson", body: "Each run ends with a plain-language explanation of what the harness did." },
];

function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-5 font-mono text-[10px] uppercase tracking-wider">
            A learning sandbox
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Learn how an agent harness actually works.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            The harness is the code around an AI model — the tools it can call, the permissions it has,
            the retries when things go wrong, and the rules that tell it when to stop. Play with it here.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Button asChild size="lg">
              <Link to="/lab">
                Open a blank lab
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#presets">Or pick a preset</a>
            </Button>
          </div>
        </section>

        {/* Presets */}
        <section id="presets" className="mt-20 scroll-mt-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Start with a preset</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Five realistic scenarios — each ships a weak and a robust harness so you can compare.
              </p>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRESETS.map((p) => (
              <li key={p.id}>
                <Link
                  to="/lab"
                  search={{ preset: p.id }}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px] font-normal uppercase tracking-wider">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.description}</p>
                  <span className="mt-4 inline-flex items-center text-xs font-medium text-foreground/80 group-hover:text-foreground">
                    Open in lab
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Four steps. Each lab run follows the same shape.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="mt-20 border-t border-border pt-6 text-xs text-muted-foreground">
          Mocked by default. Your settings and notes are saved to this browser only.
        </footer>
      </main>
    </div>
  );
}
