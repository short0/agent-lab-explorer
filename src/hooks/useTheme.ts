import { useEffect, useState, useCallback } from "react";
import { LS_KEYS, readLS, writeLS } from "@/lib/storage";

export type Theme = "light" | "dark";

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.style.colorScheme = t;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = readLS<Theme>(LS_KEYS.theme, "light");
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "light" ? "dark" : "light";
      writeLS(LS_KEYS.theme, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
