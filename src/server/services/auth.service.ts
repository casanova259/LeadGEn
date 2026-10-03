import { prisma } from "@/lib/prisma";

export type AuthProviderType = "clerk" | "authjs";

export type CurrentAuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  provider: AuthProviderType;
};

export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message = "Unauthorized: Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

export class TenantNotProvisionedError extends Error {
  statusCode: number;

  constructor(message = "Forbidden: No business tenant associated with this account") {
    super(message);
    this.name = "TenantNotProvisionedError";
    this.statusCode = 403;
  }
}

function isNextControlFlowError(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    const errorObj = err as { digest?: string; name?: string };
    if (typeof errorObj.digest === "string" && errorObj.digest.startsWith("NEXT_")) {
      return true;
    }
    if (errorObj.name === "DynamicServerError") {
      return true;
    }
  }
  return false;
}

/**
 * Retrieves the currently authenticated user from either active authentication system:
 * 1. Checks Clerk session (current production primary).
 * 2. Checks Auth.js session (NextAuth v5 foundation).
 * 3. Returns null if unauthenticated.
 */
export async function getCurrentUser(): Promise<CurrentAuthUser | null> {
  // 1. Check Clerk session first (preserves 100% of current production behavior)
  try {
    const { auth: clerkAuth } = await import("@clerk/nextjs/server");
    const { userId } = await clerkAuth();
    if (userId) {
      return {
        id: userId,
        email: null,
        name: null,
        image: null,
        provider: "clerk",
      };
    }
  } catch (err: unknown) {
    if (isNextControlFlowError(err)) {
      throw err;
    }
    // Clerk not active or context uninitialized, proceed to Auth.js
  }

  // 2. Check Auth.js session
  try {
    const { auth: authjsAuth } = await import("@/auth");
    const session = await authjsAuth();
    if (session?.user?.id) {
      return {
        id: session.user.id,
        email: session.user.email ?? null,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        provider: "authjs",
      };
    }
  } catch (err: unknown) {
    if (isNextControlFlowError(err)) {
      throw err;
    }
    // Auth.js not active in this context
  }

  return null;
}

/**
 * Requires an authenticated user, following application semantics:
 * - In an interactive HTML page request context: redirects to /sign-in
 * - In an API / programmatic / test context: throws UnauthorizedError (HTTP 401)
 */
export async function requireCurrentUser(): Promise<CurrentAuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    try {
      const { headers } = await import("next/headers");
      const headerList = await headers();
      const accept = headerList.get("accept") ?? "";
      if (accept.includes("text/html")) {
        const { redirect } = await import("next/navigation");
        redirect("/sign-in");
      }
    } catch (e: unknown) {
      if (isNextControlFlowError(e)) {
        throw e;
      }
      // If headers() is unavailable or not HTML page context, fall through to UnauthorizedError
    }
    throw new UnauthorizedError();
  }
  return user;
}

/**
 * Resolves the owner's email address safely for daily digest and notifications.
 * - If the ownerId belongs to a local Auth.js User, queries PostgreSQL directly.
 * - If the ownerId belongs to an existing Clerk account, queries the Clerk backend API.
 */
export async function resolveOwnerEmail(ownerId: string): Promise<string | null> {
  if (!ownerId) return null;

  // 1. Check local Auth.js User table first
  try {
    const localUser = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { email: true },
    });
    if (localUser?.email) {
      return localUser.email;
    }
  } catch (err) {
    console.error(`Error querying local user for owner ${ownerId}:`, err);
  }

  // 2. Fall back to Clerk backend API for existing Clerk-owned businesses
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(ownerId);
    return clerkUser.primaryEmailAddress?.emailAddress ?? null;
  } catch (err) {
    console.error(`Failed to resolve email via Clerk for owner ${ownerId}:`, err);
    return null;
  }
}
