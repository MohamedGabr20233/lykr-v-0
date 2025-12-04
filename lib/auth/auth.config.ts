import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Remove locale prefix for checking
      const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, "");

      const isOnProtected =
        pathWithoutLocale.startsWith("/onboarding") ||
        pathWithoutLocale.startsWith("/dashboard");

      const isOnAuth =
        pathWithoutLocale === "/" ||
        pathWithoutLocale === "/signup" ||
        pathWithoutLocale.startsWith("/forgot-password") ||
        pathWithoutLocale.startsWith("/reset-password");

      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false;
      } else if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/onboarding/business-info", nextUrl));
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
};
