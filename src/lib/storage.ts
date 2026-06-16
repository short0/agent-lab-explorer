export function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const LS_KEYS = {
  theme: "ahl.theme",
  mode: "ahl.mode",
  lastPreset: "ahl.lastPreset",
  notes: "ahl.notes",
  labState: "ahl.labState",
  history: "ahl.history",
} as const;
