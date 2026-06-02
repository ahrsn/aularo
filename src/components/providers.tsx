"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Density = "airy" | "balanced" | "dense";

type UIState = {
  density: Density;
  accent: boolean;
  setDensity: (d: Density) => void;
  setAccent: (a: boolean) => void;
};

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<Density>("balanced");
  const [accent, setAccentState] = useState<boolean>(true);

  // Load saved values on mount.
  useEffect(() => {
    const d = (localStorage.getItem("aularo-density") as Density | null) ?? null;
    const a = localStorage.getItem("aularo-accent");
    if (d) setDensityState(d);
    if (a !== null) setAccentState(a !== "0");
  }, []);

  const setDensity = useCallback((d: Density) => {
    setDensityState(d);
    localStorage.setItem("aularo-density", d);
  }, []);

  const setAccent = useCallback((a: boolean) => {
    setAccentState(a);
    localStorage.setItem("aularo-accent", a ? "1" : "0");
  }, []);

  const value = useMemo(
    () => ({ density, accent, setDensity, setAccent }),
    [density, accent, setDensity, setAccent],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}

/** Density-based padding helper matching the design prototypes. */
export function densityPadding(d: Density) {
  if (d === "airy") return "32px 32px 72px";
  if (d === "dense") return "20px 24px 56px";
  return "28px 32px 64px";
}
