"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheck } from "react-icons/fi";

import {
  removeGeminiApiKey,
  saveGeminiApiKey,
} from "@/app/(app)/actions/gemini-credentials";
import { AiDisabledNotice } from "@/components/shared/ai-disabled-notice";
import { DeleteButton, SaveButton } from "@/components/ui/action-buttons";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GEMINI_HELP_URL } from "@/lib/gemini/disabled-message";
import { AI_LABELS } from "@/lib/gemini/labels";

type AiSettingsPanelProps = {
  hasGeminiKey: boolean;
  keyHint: string | null;
};

export function AiSettingsPanel({ hasGeminiKey, keyHint }: AiSettingsPanelProps) {
  const router = useRouter();
  const [configured, setConfigured] = useState(hasGeminiKey);
  const [hint, setHint] = useState(keyHint);
  const [apiKey, setApiKey] = useState("");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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
    <Card padding="md">
      <h3 className="font-semibold tracking-tight text-text">
        {AI_LABELS.settingsSection}
      </h3>
      <p className="mt-1 text-sm text-text-muted">
        Your Gemini API key powers Quick entry, Money Coach, and monthly
        reports. It is encrypted in our database and never shown again after
        you save.
      </p>

      {configured ? (
        <div
          className="mt-4 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/8 px-3 py-2.5"
          role="status"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
            aria-hidden
          >
            <FiCheck className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">API key connected</p>
            <p className="mt-0.5 text-xs text-text-muted">
              Ends with{" "}
              <span className="font-mono text-text">••••{hint ?? "????"}</span>
            </p>
          </div>
        </div>
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
        <div className="mt-4 space-y-2 border-t border-glass-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {configured ? "Update or remove" : "Save your key"}
          </p>
          <div className="flex flex-col gap-2">
            <SaveButton
              type="submit"
              size="default"
              fullWidth
              loading={aiLoading}
              disabled={apiKey.trim().length < 10}
            >
              {configured ? "Update key" : "Save key"}
            </SaveButton>
            {configured ? (
              <DeleteButton
                type="button"
                disabled={aiLoading}
                onClick={() => void handleRemoveApiKey()}
                className="self-center"
              >
                Remove key
              </DeleteButton>
            ) : null}
          </div>
        </div>
      </form>
    </Card>
  );
}
