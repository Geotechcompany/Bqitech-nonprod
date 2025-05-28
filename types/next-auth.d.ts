import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    emailVerified?: Date;
  }

  interface Session {
    user: {
      role?: string;
      emailVerified?: Date;
    } & DefaultSession["user"];
  }
} 