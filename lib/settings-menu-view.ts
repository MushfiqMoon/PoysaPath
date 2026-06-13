export const SETTINGS_MENU_VIEW_STORAGE_KEY = "poysapath-settings-menu-view";

export type SettingsMenuView = "list" | "grid";

export function isSettingsMenuView(value: string): value is SettingsMenuView {
  return value === "list" || value === "grid";
}

export function getStoredSettingsMenuView(): SettingsMenuView {
  if (typeof window === "undefined") return "list";
  try {
    const raw = localStorage.getItem(SETTINGS_MENU_VIEW_STORAGE_KEY);
    if (raw && isSettingsMenuView(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "list";
}

export function setStoredSettingsMenuView(view: SettingsMenuView) {
  try {
    localStorage.setItem(SETTINGS_MENU_VIEW_STORAGE_KEY, view);
  } catch {
    /* ignore */
  }
}
