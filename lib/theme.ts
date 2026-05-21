export const THEME_STORAGE_KEY = "poysapath-theme";

export type ThemePreference = "light" | "dark" | "system";

export function isThemePreference(value: string): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw && isThemePreference(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "system";
}

export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.dataset.theme = preference;
  }
}

export function setStoredTheme(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
  applyTheme(preference);
}
