import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../prisma";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Providers.Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      authorize: async (creds) => {
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (user) return user;
        return null;
      },
    }),
  ],
  session: { jwt: true },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.discountRate = user.discountRate;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.discountRate = token.discountRate as number;
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
});
