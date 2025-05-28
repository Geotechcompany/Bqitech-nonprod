import { getServerSession as getSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import connectToDatabase from "@/lib/mongodb"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("User does not exist");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Incorrect password");
          }

          return user;
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add database refresh on every JWT callback
      await mongoose.connect(process.env.MONGODB_URI!);
      const dbUser = await User.findById(token.id || user?.id);
      
      if (dbUser) {
        return {
          ...token,
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          emailVerified: dbUser.emailVerified
        };
      }
      
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          emailVerified: token.emailVerified
        }
      }
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  }
}

export async function isAdmin() {
  const session = await getSession({ 
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET 
  });
  return session?.user?.role === "ADMIN";
}

export { getSession }; 