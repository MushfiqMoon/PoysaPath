"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { SettingsMenu } from "@/components/settings/settings-menu";
import { SettingsViewToggle } from "@/components/settings/settings-view-toggle";
import {
  getStoredSettingsMenuView,
  setStoredSettingsMenuView,
  type SettingsMenuView,
} from "@/lib/settings-menu-view";

type SettingsMenuSectionProps = {
  showAdminLink?: boolean;
};

export function SettingsMenuSection({
  showAdminLink = false,
}: SettingsMenuSectionProps) {
  const [view, setView] = useState<SettingsMenuView>("list");

  useEffect(() => {
    setView(getStoredSettingsMenuView());
  }, []);

  function handleViewChange(next: SettingsMenuView) {
    setView(next);
    setStoredSettingsMenuView(next);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Profile, categories, budgets, and more"
        action={
          <SettingsViewToggle value={view} onChange={handleViewChange} />
        }
      />
      <SettingsMenu showAdminLink={showAdminLink} view={view} />
    </div>
  );
}
