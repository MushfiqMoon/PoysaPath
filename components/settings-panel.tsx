"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  removeGeminiApiKey,
  saveGeminiApiKey,
} from "@/app/(app)/actions/gemini-credentials";
import { updateDisplayName } from "@/app/(app)/actions/profile";
import { AiDisabledNotice } from "@/components/ai-disabled-notice";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GEMINI_HELP_URL } from "@/lib/gemini/disabled-message";
import { AI_LABELS } from "@/lib/gemini/labels";

type SettingsPanelProps = {
  email: string;
  displayName: string | null;
  hasGeminiKey: boolean;
  keyHint: string | null;
};

export function SettingsPanel({
  email,
  displayName,
  hasGeminiKey,
  keyHint,
}: SettingsPanelProps) {
  const router = useRouter();
  const [name, setName] = useState(displayName ?? "");
  const [configured, setConfigured] = useState(hasGeminiKey);
  const [hint, setHint] = useState(keyHint);
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

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

  async function handleSaveApiKey(e: React.FormEvent) {
    e.preventDefault();
    setAiLoading(true);
    setAiError(null);
    setAiMessage(null);
    try {
      await saveGeminiApiKey(apiKey);
      setApiKey("");
      setConfigured(true);
      setHint(apiKey.trim().slice(-4));
      setAiMessage(`API key saved. ${AI_LABELS.featuresEnabled}`);
      router.refresh();
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Could not save API key");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleRemoveApiKey() {
    setAiLoading(true);
    setAiError(null);
    setAiMessage(null);
    try {
      await removeGeminiApiKey();
      setApiKey("");
      setConfigured(false);
      setHint(null);
      setAiMessage("API key removed.");
      router.refresh();
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Could not remove API key");
    } finally {
      setAiLoading(false);
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
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </Card>

      <Card
        padding="md"
        id="ai"
        className="scroll-mt-6"
      >
        <h3 className="font-semibold tracking-tight text-text">{AI_LABELS.settingsSection}</h3>
        <p className="mt-1 text-sm text-text-muted">
        Your Gemini API key powers  Quick entry and Weekly insights. It is encrypted in our database and never shown again after you save.
        </p>

        {configured ? (
          <p className="mt-3 text-sm text-text">
            Configured{" "}
            <span className="font-mono text-text-muted">
              (••••{hint ?? "????"})
            </span>
          </p>
        ) : (
          <div className="mt-3">
            <AiDisabledNotice compact />
          </div>
        )}

        <form onSubmit={handleSaveApiKey} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="gemini-api-key">
              {configured ? "Replace API key" : "Google Gemini API key"}
            </Label>
            <Input
              id="gemini-api-key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key"
              className="mt-1.5 font-mono text-sm"
            />
            <p className="mt-1.5 text-xs text-text-muted">
              Free to create at{" "}
              <a
                href={GEMINI_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>
          {aiMessage && (
            <p className="text-sm text-accent" role="status">
              {aiMessage}
            </p>
          )}
          {aiError && (
            <p className="text-sm text-danger" role="alert">
              {aiError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={aiLoading || apiKey.trim().length < 10}>
              {aiLoading ? "Saving…" : configured ? "Update key" : "Save key"}
            </Button>
            {configured && (
              <Button
                type="button"
                variant="ghost"
                disabled={aiLoading}
                onClick={() => void handleRemoveApiKey()}
              >
                Remove key
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card padding="md">
        <h3 className="font-semibold tracking-tight text-text">Appearance</h3>
        <p className="mt-1 text-sm text-text-muted">
          Choose light, dark, or match your device.
        </p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </Card>

      <Card padding="md">
        <h3 className="font-semibold tracking-tight text-text">Legal</h3>
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
      </Card>

      <p className="text-center text-xs text-text-muted pb-4">
        All rights reserved. Develop by{" "}
        <a
          href="https://github.com/MushfiqMoon"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Mushfiq
        </a>
      </p>
    </div>
  );
}
