"use client";

import {
  getStoredTheme,
  setStoredTheme,
  type ThemePreference,
} from "@/lib/theme";
import { Card } from "@/components/ui/card";
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

  const activeIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === theme),
  );

  return (
    <Card
      padding="none"
      className="bg-bg/50 p-1.5"
      role="radiogroup"
      aria-label="Color theme"
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-xl bg-accent transition-[transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{
            width: `${100 / options.length}%`,
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
          }}
          aria-hidden
        />
        <div className="relative z-10 grid grid-cols-3">
          {options.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => select(opt.value)}
                className={[
                  "min-h-10 rounded-xl text-sm font-medium transition-colors duration-300 motion-reduce:transition-none",
                  active
                    ? "text-white"
                    : "text-text-muted hover:text-text",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
