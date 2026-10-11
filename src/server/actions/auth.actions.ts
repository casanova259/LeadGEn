"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type RegisterResult = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export async function registerUserAction(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): Promise<RegisterResult> {
  const name = formData.name?.trim();
  const email = formData.email?.trim().toLowerCase();
  const password = formData.password;
  const confirmPassword = formData.confirmPassword;

  const fieldErrors: RegisterResult["fieldErrors"] = {};

  if (!name || name.length < 2) {
    fieldErrors.name = "Name must be at least 2 characters long.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (!password || password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters long.";
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please correct the errors in the form.",
      fieldErrors,
    };
  }

  try {
    // 1. Pre-check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    // 2. Hash password with bcryptjs (12 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Atomically create User and their initial multi-tenant Business
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: new Date(),
        } as Prisma.UserCreateInput & { password?: string | null },
      });

      await tx.business.create({
        data: {
          ownerId: user.id,
          name: `${name}'s Business`,
        },
      });

      return user;
    });

    return { success: true };
  } catch (err: unknown) {
    // Handle database uniqueness race conditions safely
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    console.error("Registration error:", err instanceof Error ? err.message : "Unknown error");
    return {
      success: false,
      error: "An unexpected error occurred during account creation. Please try again.",
    };
  }
}
