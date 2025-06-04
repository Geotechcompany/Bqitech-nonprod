import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

const sessionCallback = {
  async session({ session, user }) {
    session.user.role = user.role;
    return session;
  }
};

handler.authOptions = {
  ...authOptions,
  callbacks: sessionCallback
}; 