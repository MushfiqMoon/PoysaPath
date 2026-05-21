"use client";

import { useEffect } from "react";

import { applyTheme, getStoredTheme } from "@/lib/theme";

/** Syncs theme from localStorage after hydration (inline script handles first paint). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getStoredTheme());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredTheme() === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return children;
}
