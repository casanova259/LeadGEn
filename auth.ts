import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Prevent Vercel production from accidentally using localhost if AUTH_URL was copied from .env
if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  if (process.env.AUTH_URL && process.env.AUTH_URL.includes("localhost")) {
    delete process.env.AUTH_URL;
  }
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes("localhost")) {
    delete process.env.NEXTAUTH_URL;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "2d703c27fb3cbfcf054418280fd3602b5e77f527e95de2db0d8c1371f91268a8",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    newUser: "/dashboard",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const user = (await prisma.user.findUnique({
          where: { email },
        })) as { id: string; email: string | null; name: string | null; image: string | null; password?: string | null } | null;

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
