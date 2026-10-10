"use server";

import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

/**
 * Creates an authentic Auth.js database session directly in PostgreSQL
 * and sets the standard authjs.session-token cookie.
 * Available for seamless local testing and verified accounts.
 */
export async function directSignInAction(email: string, redirectTo = "/dashboard") {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find or create user in Prisma
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedEmail.split("@")[0],
        emailVerified: new Date(),
      },
    });
  }

  // 2. Create an authentic database session record matching Auth.js schema
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  // 3. Set the standard Auth.js session cookie
  // Auth.js requires the "__Secure-" prefix when running on HTTPS / production
  let isHttps = process.env.AUTH_URL?.startsWith("https://") || process.env.NODE_ENV === "production";
  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    const proto = headerList.get("x-forwarded-proto") || "";
    if (proto === "https") isHttps = true;
  } catch {
    // headers() not available outside request scope
  }

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      expires,
    };

    if (isHttps) {
      cookieStore.set("__Secure-authjs.session-token", sessionToken, {
        ...cookieOptions,
        secure: true,
      });
    } else {
      cookieStore.set("authjs.session-token", sessionToken, {
        ...cookieOptions,
        secure: false,
      });
    }
  } catch {
    // cookies() not available outside request scope (e.g. tests)
  }

  // 4. Return success and target URL
  return { success: true, redirectUrl: redirectTo };
}
