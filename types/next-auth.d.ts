import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    emailVerified?: Date;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
} 