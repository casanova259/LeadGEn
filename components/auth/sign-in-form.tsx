"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, ArrowRight, Loader2, Zap } from "lucide-react";
import { directSignInAction } from "@/src/server/actions/dev-auth.actions";

const DEMO_ACCOUNTS = [
  { label: "Manik (Owner)", email: "casanova270407@gmail.com" },
  { label: "Account 001", email: "manikstake001@gmail.com" },
];

export function SignInForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Direct Instant Sign-in (sets authentic Auth.js database session in PostgreSQL)
  async function handleDirectSignIn(targetEmail?: string) {
    const finalEmail = targetEmail || email;
    if (!finalEmail) {
      setError("Please enter your email address");
      return;
    }

    setIsDirectLoading(true);
    setError(null);

    try {
      const result = await directSignInAction(finalEmail, redirectTo);
      if (result?.success) {
        window.location.href = result.redirectUrl || redirectTo;
        return;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create session. Please check your database connection.");
      setIsDirectLoading(false);
    }
  }

  // 2. Resend Magic Link Sign-in
  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: redirectTo,
      });

      if (res?.error) {
        setError("Failed to send sign-in link. Please check your email and try again.");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Check your inbox</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          We sent a secure magic sign-in link to <span className="font-medium text-foreground">{email}</span>. Click the link to sign in.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setEmail("");
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline pt-2"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="signin-email" className="text-xs text-muted-foreground">
            Email address
          </Label>
          <div className="relative">
            <Input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="casanova270407@gmail.com"
              required
              className="pl-9 text-sm bg-background border-input"
              disabled={isLoading || isDirectLoading}
            />
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          <Button
            type="button"
            onClick={() => handleDirectSignIn()}
            disabled={isLoading || isDirectLoading || !email}
            className="w-full text-xs font-medium h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isDirectLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Zap className="size-3.5" />
                <span>Sign In Instantly</span>
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>

          <Button
            type="submit"
            variant="outline"
            disabled={isLoading || isDirectLoading || !email}
            className="w-full text-xs font-medium h-9 gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Sending Magic Link...</span>
              </>
            ) : (
              <>
                <Mail className="size-3.5" />
                <span>Send Magic Link (Email)</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quick Access Dev / Migrated Accounts */}
      <div className="pt-3 border-t border-border/60 text-left">
        <p className="text-[11px] font-medium text-muted-foreground mb-2">
          Or sign in with a demo account:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                handleDirectSignIn(acc.email);
              }}
              disabled={isDirectLoading || isLoading}
              className="text-[11px] px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border/80 transition flex items-center gap-1"
            >
              <span>{acc.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
