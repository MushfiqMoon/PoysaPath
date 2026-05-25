"use client";

import { useState } from "react";

import { updateDisplayName } from "@/app/(app)/actions/profile";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { SaveButton } from "@/components/ui/action-buttons";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileSettingsProps = {
  email: string;
  displayName: string | null;
};

export function ProfileSettings({ email, displayName }: ProfileSettingsProps) {
  const [name, setName] = useState(displayName ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updateDisplayName(name);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="md">
        <h3 className="font-semibold tracking-tight text-text">Profile</h3>
        <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="opacity-70" />
          </div>
          {message && (
            <p className="text-sm text-accent" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <SaveButton type="submit" size="default" loading={loading}>
            Save profile
          </SaveButton>
        </form>
      </Card>

      <Card padding="md">
        <h3 className="font-semibold tracking-tight text-text">Preferences</h3>
        <p className="mt-1 text-sm text-text-muted">
          Choose light, dark, or match your device.
        </p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </Card>
    </div>
  );
}
