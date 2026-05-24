"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";

import { BackLink } from "@/components/back-link";
import { Logo } from "@/components/logo";
import { GEMINI_CONTACT } from "@/lib/gemini/disabled-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "forgot";

type AuthFormProps = {
  mode: AuthMode;
};

function formatAuthError(error: { message?: string; code?: string }): string {
  const message = error.message ?? "Something went wrong";
  if (
    error.code === "over_email_send_rate_limit" ||
    message.includes("email rate limit")
  ) {
    return "Supabase email limit reached (about 3/hour on free tier). Wait an hour, turn off Confirm email in Supabase for dev, add a user in the dashboard, or configure custom SMTP.";
  }
  return message;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(formatAuthError(signUpError));
          return;
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Password reset via email is disabled for now — users contact the developer.
      // if (mode === "forgot") {
      //   const redirectTo = `${window.location.origin}/login`;
      //   const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      //     email,
      //     { redirectTo },
      //   );
      //
      //   if (resetError) {
      //     setError(formatAuthError(resetError));
      //     return;
      //   }
      //
      //   setMessage("Check your email for a password reset link.");
      //   return;
      // }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    login: "Welcome back",
    signup: "Create your account",
    forgot: "Forgot password",
  };

  return (
    <div className="w-full min-h-[30rem]">
      <BackLink href={mode === "login" ? "/" : "/login"} className="mb-4">
        Back
      </BackLink>

      <Card elevated padding="lg" className="flex min-h-[24rem] flex-col md:min-h-[22rem]">
        <div className="mb-6 text-center md:text-left">
          <Logo size={48} showWordmark className="mx-auto justify-center md:mx-0" />
          <h1
            className="mt-4 text-2xl font-semibold tracking-tight text-text"
            style={{ letterSpacing: "-0.02em" }}
          >
            {titles[mode]}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {mode === "signup"
              ? "Track every taka, every day."
              : mode === "forgot"
                ? "Contact the developer to reset your password."
                : "Sign in to continue to PoysaPath."}
          </p>
        </div>

        {mode === "forgot" ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-text-muted">
              Self-service password reset is not available yet. Reach out to{" "}
              {GEMINI_CONTACT.name} and we will help you get back into your
              account.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={GEMINI_CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-input)] border border-border bg-bg px-3 py-2 text-sm font-medium text-text transition-[background-image,background-color] duration-[var(--dur-short)] hover:bg-surface/80"
              >
                <FaLinkedin className="h-4 w-4 text-[#0A66C2]" aria-hidden />
                LinkedIn
              </a>
              <a
                href={GEMINI_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-input)] border border-border bg-bg px-3 py-2 text-sm font-medium text-text transition-[background-image,background-color] duration-[var(--dur-short)] hover:bg-surface/80"
              >
                <FaWhatsapp className="h-4 w-4 text-[#25D366]" aria-hidden />
                WhatsApp {GEMINI_CONTACT.whatsapp}
              </a>
            </div>
            <Link
              href="/login"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-[var(--radius-input)] border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-[background-color] duration-[var(--dur-short)] hover:bg-accent/15"
            >
              Back to log in
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === "signup" && (
            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-accent" role="status">
              {message}
            </p>
          )}

          <div className="mt-2 pt-2">
            <Button type="submit" fullWidth disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Log in"
                  : "Sign up"}
            </Button>
          </div>
        </form>
        )}

        {mode === "login" && (
          <p className="mt-6 text-center text-sm text-text-muted">
            No account?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Sign up
            </Link>
          </p>
        )}

        {mode === "signup" && (
          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Log in
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
