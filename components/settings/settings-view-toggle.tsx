"use client";

import { FiGrid, FiList } from "react-icons/fi";

import type { SettingsMenuView } from "@/lib/settings-menu-view";

const options: {
  value: SettingsMenuView;
  label: string;
  Icon: typeof FiList;
}[] = [
  { value: "list", label: "List view", Icon: FiList },
  { value: "grid", label: "Grid view", Icon: FiGrid },
];

type SettingsViewToggleProps = {
  value: SettingsMenuView;
  onChange: (view: SettingsMenuView) => void;
};

export function SettingsViewToggle({ value, onChange }: SettingsViewToggleProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-1"
      role="radiogroup"
      aria-label="Settings menu layout"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            onClick={() => onChange(opt.value)}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-[var(--dur-short)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              active ? "text-accent" : "text-text-muted hover:text-text",
            ].join(" ")}
          >
            <opt.Icon className="h-4 w-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
