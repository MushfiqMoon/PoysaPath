import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiBell,
  FiEdit3,
  FiFolder,
  FiHome,
  FiKey,
  FiList,
  FiLock,
  FiPieChart,
  FiPlusCircle,
  FiShield,
  FiSmartphone,
  FiTag,
  FiFileText,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiZap,
} from "react-icons/fi";

/** Icons for each feature card on the marketing home page (Feather set, matches app chrome). */
export const FEATURE_ICONS = {
  dashboard: FiHome,
  expenses: FiList,
  edit: FiEdit3,
  manual: FiPlusCircle,
  quick: FiZap,
  "categories-required": FiTag,
  "weekly-insight": FiTrendingUp,
  "category-breakdown": FiBarChart2,
  budgets: FiPieChart,
  goals: FiTarget,
  recurring: FiRefreshCw,
  "monthly-report": FiFileText,
  profile: FiUser,
  "categories-crud": FiFolder,
  "budgets-settings": FiPieChart,
  "gemini-key": FiKey,
  announcements: FiBell,
  auth: FiLock,
  isolation: FiShield,
  pwa: FiSmartphone,
} as const satisfies Record<string, IconType>;

export type FeatureIconKey = keyof typeof FEATURE_ICONS;
