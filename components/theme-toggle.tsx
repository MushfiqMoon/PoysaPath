"use client";

import {
  getStoredTheme,
  setStoredTheme,
  type ThemePreference,
} from "@/lib/theme";
import { useEffect, useState } from "react";

const options: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function select(next: ThemePreference) {
    setTheme(next);
    setStoredTheme(next);
  }

  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-bg p-1"
      role="radiogroup"
      aria-label="Color theme"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={theme === opt.value}
          onClick={() => select(opt.value)}
          className={[
            "min-h-10 rounded-lg text-sm font-medium transition-colors",
            theme === opt.value
              ? "bg-accent text-white"
              : "text-text-muted hover:text-text",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
