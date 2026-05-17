"use client";

import Link from "next/link";
import { useState } from "react";

import { updateDisplayName } from "@/app/(app)/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingsPanelProps = {
  email: string;
  displayName: string | null;
};

export function SettingsPanel({ email, displayName }: SettingsPanelProps) {
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
      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-medium text-text">Profile</h3>
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
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-medium text-text">Legal</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-accent hover:underline">
              Terms of use
            </Link>
          </li>
        </ul>
      </section>

      <p className="text-center text-xs text-text-muted pb-4">
        All rights reserved. Develop by <a href="https://github.com/MushfiqMoon" className="text-accent hover:underline">Mushfiq</a>
      </p>
    </div>
  );
}
