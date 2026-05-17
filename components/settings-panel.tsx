"use client";

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
  const [exporting, setExporting] = useState(false);

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

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/export/csv");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "poysapath-expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not export CSV.");
    } finally {
      setExporting(false);
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
        <h3 className="font-medium text-text">Data</h3>
        <p className="mt-1 text-sm text-text-muted">
          Download all your expenses as CSV.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full"
          disabled={exporting}
          onClick={handleExport}
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </section>

      <p className="text-center text-xs text-text-muted">
        Currency: BDT (৳) · Timezone: Asia/Dhaka
      </p>
    </div>
  );
}
