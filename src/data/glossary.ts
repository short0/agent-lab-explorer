export interface GlossaryEntry {
  term: string;
  short: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: "Harness", short: "The code around the model that decides what tools it can use, how long it can run, and what to do when it fails." },
  { term: "Tool", short: "A function the agent can call — search the web, run code, look up a record." },
  { term: "Permissions", short: "What the agent is allowed to touch — read files, write files, reach the network." },
  { term: "Memory", short: "What the agent remembers between steps — past tool results, scratchpad notes." },
  { term: "Hook", short: "A small piece of logic that runs at a specific point — before a tool call, after a failure, on escalation." },
  { term: "Trace", short: "The recorded sequence of decisions, tool calls, and results from a single run." },
  { term: "Retry", short: "Running a failed step again, often with a different prompt or backoff." },
  { term: "Stop condition", short: "A rule that ends the run — max iterations, budget hit, success signal." },
  { term: "Sandbox", short: "An isolated environment where the agent can run code or write files safely." },
  { term: "Failure injection", short: "Deliberately making a tool fail to test how the harness recovers." },
];
