import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    Resend({
      from: process.env.RESEND_FROM_EMAIL || "Lost Leads <onboarding@resend.dev>",
    }),
  ],
  trustHost: true,
});
