"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { registerUserAction } from "@/src/server/actions/auth.actions";

export function SignUpForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Client-side quick validation
  function validateClient(): boolean {
    const errs: typeof fieldErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password || password.length < 8) {
      errs.password = "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateClient()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUserAction({
        name,
        email,
        password,
        confirmPassword,
      });

      if (!res.success) {
        setError(res.error || "Registration failed. Please check the form.");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Automatically sign in upon registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: redirectTo,
      });

      if (signInRes?.error) {
        // Registration succeeded, but auto-sign-in encountered an issue; redirect to sign-in page
        window.location.href = `/sign-in?registered=true`;
      } else {
        window.location.href = redirectTo;
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Account created!</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Setting up your workspace and signing you in...
        </p>
        <div className="flex justify-center pt-2">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="signup-name" className="text-xs text-muted-foreground">
            Full name
          </Label>
          <div className="relative">
            <Input
              id="signup-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
              }}
              placeholder="Alex Johnson"
              required
              disabled={isLoading}
              className={`pl-9 text-sm bg-background border-input ${
                fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          </div>
          {fieldErrors.name && (
            <p className="text-[11px] text-destructive">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="signup-email" className="text-xs text-muted-foreground">
            Work email
          </Label>
          <div className="relative">
            <Input
              id="signup-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              placeholder="alex@company.com"
              required
              disabled={isLoading}
              className={`pl-9 text-sm bg-background border-input ${
                fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] text-destructive">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="signup-password" className="text-xs text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
              }}
              placeholder="At least 8 characters"
              required
              disabled={isLoading}
              className={`pl-9 pr-9 text-sm bg-background border-input ${
                fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
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
          {fieldErrors.password && (
            <p className="text-[11px] text-destructive">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="signup-confirm-password" className="text-xs text-muted-foreground">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                }
              }}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              className={`pl-9 pr-9 text-sm bg-background border-input ${
                fieldErrors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[11px] text-destructive">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full text-xs font-medium h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 text-center text-[11px] text-muted-foreground border-t border-border/60">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline hover:text-primary">
          Sign in
        </Link>
      </div>
    </div>
  );
}
