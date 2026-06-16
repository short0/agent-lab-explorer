import { Link, useRouter } from "@tanstack/react-router";
import { Moon, Sun, Undo2, Redo2, RotateCcw, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";

interface TopBarProps {
  mode?: "mocked" | "live";
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function TopBar({ mode, onUndo, onRedo, onReset, canUndo, canRedo }: TopBarProps) {
  const { theme, toggle } = useTheme();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-muted">
            <FlaskConical className="h-4 w-4" aria-hidden />
          </span>
          <span className="truncate">Agent Harness Lab</span>
        </Link>

        {mode ? (
          <Badge
            variant="outline"
            className={
              mode === "live"
                ? "ml-2 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "ml-2 border-border bg-muted text-muted-foreground"
            }
          >
            <span
              className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                mode === "live" ? "bg-amber-500" : "bg-muted-foreground/70"
              }`}
              aria-hidden
            />
            {mode === "live" ? "Live mode" : "Simulated"}
          </Badge>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          {onUndo && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Undo"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-9 w-9"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
          {onRedo && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Redo"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-9 w-9"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          )}
          {onReset && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reset to home"
              onClick={() => {
                onReset();
                router.navigate({ to: "/" });
              }}
              className="h-9 w-9"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            onClick={toggle}
            className="h-9 w-9"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
