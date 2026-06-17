import { useCallback, useEffect, useRef, useState } from "react";
import { LS_KEYS, readLS, writeLS } from "@/lib/storage";
import type { HarnessVariant, LabState, Preset } from "@/lib/types";
import { PRESETS_BY_ID } from "@/data/presets";

const DEFAULT_STATE: LabState = {
  presetId: null,
  task: "",
  harness: "robust",
  settings: {
    maxIterations: 6,
    retryCount: 1,
    allowedTools: [],
    permissions: ["read"],
    failureInjection: false,
    sandbox: true,
  },
  mode: "mocked",
  notes: "",
  lastRunVariant: null,
  lastChange: null,
};

const HISTORY_CAP = 50;

interface HistoryStore {
  past: LabState[];
  future: LabState[];
}

export function presetToState(preset: Preset, variant: HarnessVariant = "robust"): LabState {
  const v = variant === "weak" ? preset.weak : preset.robust;
  return {
    presetId: preset.id,
    task: preset.task,
    harness: variant,
    settings: v.harness,
    mode: "mocked",
    notes: readLS(LS_KEYS.notes, ""),
    lastRunVariant: null,
    lastChange: `Loaded preset: ${preset.title}`,
  };
}

export function useLabState(initialPresetId?: string | null) {
  const [state, setStateRaw] = useState<LabState>(DEFAULT_STATE);
  const [history, setHistory] = useState<HistoryStore>({ past: [], future: [] });
  const hydrated = useRef(false);

  // hydrate
  useEffect(() => {
    if (hydrated.current) return;
    if (initialPresetId && PRESETS_BY_ID[initialPresetId]) {
      setStateRaw(presetToState(PRESETS_BY_ID[initialPresetId], "robust"));
    } else {
      const saved = readLS<LabState | null>(LS_KEYS.labState, null);
      if (saved) setStateRaw(saved);
    }
    const hist = readLS<HistoryStore>(LS_KEYS.history, { past: [], future: [] });
    setHistory(hist);
    hydrated.current = true;
  }, [initialPresetId]);

  // persist
  useEffect(() => {
    if (!hydrated.current) return;
    writeLS(LS_KEYS.labState, state);
    writeLS(LS_KEYS.notes, state.notes);
    if (state.presetId) writeLS(LS_KEYS.lastPreset, state.presetId);
    writeLS(LS_KEYS.mode, state.mode);
  }, [state]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeLS(LS_KEYS.history, history);
  }, [history]);

  const commit = useCallback((next: LabState, changeLabel: string) => {
    setStateRaw((prev) => {
      setHistory((h) => ({
        past: [...h.past, prev].slice(-HISTORY_CAP),
        future: [],
      }));
      return { ...next, lastChange: changeLabel };
    });
  }, []);

  const update = useCallback(
    (mut: (s: LabState) => LabState, changeLabel: string) => {
      setStateRaw((prev) => {
        const next = mut(prev);
        setHistory((h) => ({
          past: [...h.past, prev].slice(-HISTORY_CAP),
          future: [],
        }));
        return { ...next, lastChange: changeLabel };
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const prev = h.past[h.past.length - 1];
      setStateRaw((current) => {
        setHistory((hh) => ({
          past: hh.past.slice(0, -1),
          future: [current, ...hh.future].slice(0, HISTORY_CAP),
        }));
        return prev;
      });
      return h;
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      setStateRaw((current) => {
        setHistory((hh) => ({
          past: [...hh.past, current].slice(-HISTORY_CAP),
          future: hh.future.slice(1),
        }));
        return next;
      });
      return h;
    });
  }, []);

  const reset = useCallback(() => {
    setHistory({ past: [], future: [] });
    setStateRaw(DEFAULT_STATE);
  }, []);

  const loadPreset = useCallback(
    (presetId: string, variant: HarnessVariant = "robust") => {
      const preset = PRESETS_BY_ID[presetId];
      if (!preset) return;
      commit(presetToState(preset, variant), `Loaded ${preset.title}`);
    },
    [commit],
  );

  return {
    state,
    update,
    commit,
    undo,
    redo,
    reset,
    loadPreset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}

export { DEFAULT_STATE };
