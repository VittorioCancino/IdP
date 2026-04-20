import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { verifyAdminCredentials } from "@/lib/db/admin-users";
import { LoginBodySchema } from "@/lib/types/auth.types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsedCredentials = LoginBodySchema.safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const result = await verifyAdminCredentials(
          parsedCredentials.data.email,
          parsedCredentials.data.password,
        );

        if (result.err) return null;

        return result.val;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.sub || !token.email || !token.name) {
        return session;
      }

      session.user.id = token.sub;
      session.user.email = token.email;
      session.user.name = token.name;

      return session;
    },
  },
});
