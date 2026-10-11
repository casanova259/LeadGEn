"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export function SignInForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const searchParams = useSearchParams();
  const callbackUrlParam = searchParams.get("callbackUrl");
  const isJustRegistered = searchParams.get("registered") === "true";

  // Sanitize redirect target to prevent open redirects
  let targetUrl = callbackUrlParam || redirectTo;
  if (!targetUrl.startsWith("/") || targetUrl.startsWith("//")) {
    targetUrl = "/dashboard";
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
        callbackUrl: targetUrl,
      });

      if (res?.error) {
        // Generic authentication error: does not disclose whether account exists
        setError("Invalid email or password. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      // Successful credentials authentication: redirect to target destination
      window.location.href = targetUrl;
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("An unexpected error occurred during sign in. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {isJustRegistered && !error && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Account created successfully! Please sign in with your credentials.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
              placeholder="alex@company.com"
              required
              disabled={isLoading}
              className="pl-9 text-sm bg-background border-input"
            />
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="signin-password" className="text-xs text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="pl-9 pr-9 text-sm bg-background border-input"
            />
            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full text-xs font-medium h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 text-center text-[11px] text-muted-foreground border-t border-border/60">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-foreground underline hover:text-primary">
          Sign up
        </Link>
      </div>
    </div>
  );
}
