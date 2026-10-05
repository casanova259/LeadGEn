import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-xl font-heading font-semibold tracking-tight">Create your Lost Leads account</h1>
          <p className="text-xs text-muted-foreground">
            Get started in seconds with a secure passwordless sign-in link.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SignInForm />
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="underline hover:text-foreground">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
