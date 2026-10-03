"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export function SignInForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

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
            placeholder="name@company.com"
            required
            className="pl-9 text-sm bg-background border-input"
            disabled={isLoading}
          />
          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full text-xs font-medium h-9 gap-1.5">
        {isLoading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>Sending link...</span>
          </>
        ) : (
          <>
            <span>Continue with Email</span>
            <ArrowRight className="size-3.5" />
          </>
        )}
      </Button>
    </form>
  );
}
