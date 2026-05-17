"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
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

      if (mode === "forgot") {
        const redirectTo = `${window.location.origin}/login`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          { redirectTo },
        );

        if (resetError) {
          setError(formatAuthError(resetError));
          return;
        }

        setMessage("Check your email for a password reset link.");
        return;
      }

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
    forgot: "Reset password",
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <Link
        href={mode === "login" ? "/" : "/login"}
        className="mb-6 inline-block text-sm text-text-muted hover:text-text"
      >
        ← Back
      </Link>

      <Logo size={48} showWordmark className="mb-4" />
      <h1 className="text-2xl font-semibold text-text">{titles[mode]}</h1>
      <p className="mt-2 text-text-muted">
        {mode === "signup"
          ? "Track every taka, every day."
          : mode === "forgot"
            ? "We will email you a reset link."
            : "Sign in to continue to PoysaPath."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

        {mode !== "forgot" && (
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
        )}

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
            <Link href="/forgot-password" className="text-sm text-accent">
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

        <Button type="submit" fullWidth disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : mode === "signup"
                ? "Sign up"
                : "Send reset link"}
        </Button>
      </form>

      {mode === "login" && (
        <p className="mt-6 text-center text-sm text-text-muted">
          No account?{" "}
          <Link href="/signup" className="font-medium text-accent">
            Sign up
          </Link>
        </p>
      )}

      {mode === "signup" && (
        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
