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
  const [exporting, setExporting] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

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
      const params = new URLSearchParams();
      if (exportFrom) params.set("from", exportFrom);
      if (exportTo) params.set("to", exportTo);
      const qs = params.toString();
      const res = await fetch(`/api/export/csv${qs ? `?${qs}` : ""}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "poysapath-expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not export CSV.",
      );
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
          Download expenses as CSV. Leave dates empty to export everything.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="export-from">From (optional)</Label>
            <Input
              id="export-from"
              type="date"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="export-to">To (optional)</Label>
            <Input
              id="export-to"
              type="date"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
            />
          </div>
        </div>
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

      <p className="text-center text-xs text-text-muted">
        Currency: BDT (৳) · Timezone: Asia/Dhaka
      </p>
    </div>
  );
}
