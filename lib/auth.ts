import { getServerSession as getSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import connectToDatabase from "@/lib/mongodb"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { isConnected } from "@/lib/mongodb"

import GitHub from "next-auth/providers/github";

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
          const { db } = await connectToDatabase();
          
          if (!db) throw new Error('Database not connected');

          const user = await db.collection('users').findOne({
            email: credentials.email
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            _persist: true
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
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
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (!(await isConnected())) {
          await connectToDatabase();
        }
        
        const userId = (token.id || user?.id) as string;
        if (!userId) return token;

        const { db } = await connectToDatabase();
        const dbUser = await db.collection('users').findOne({ 
          _id: new mongoose.Types.ObjectId(userId)
        });

        return dbUser ? {
          ...token,
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          _persist: true
        } : token;
      } catch (error) {
        console.error('JWT error:', error);
        return token;
      }
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