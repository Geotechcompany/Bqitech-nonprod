import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/user";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-jwt-secret-key';

// Custom auth options for compatibility with existing API routes
export const authOptions = {
  // This is now a placeholder for backward compatibility
  // The actual authentication is handled by our custom system
  providers: [],
  callbacks: {},
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: JWT_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: JWT_SECRET,
  }
};

// Get user from JWT token in request headers
export async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth_token')?.value ||
                  request.headers.get('x-auth-token');

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({
      _id: decoded.userId
    });

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified
    };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Check if user is admin from request
export async function isAdminFromRequest(request: NextRequest): Promise<boolean> {
  try {
    const user = await getUserFromRequest(request);
    return user?.role === 'ADMIN' || user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Legacy function for backward compatibility
export async function isAdmin(): Promise<boolean> {
  // In server-side contexts, this should be called with a request object
  // For now, return false as a fallback
  console.warn('isAdmin() called without request context. Use isAdminFromRequest(request) instead.');
  return false;
}

// Get session function for backward compatibility
export async function getSession(request?: NextRequest) {
  if (!request) {
    return null;
  }

  const user = await getUserFromRequest(request);
  
  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Authenticate user with credentials
export async function authenticateUser(email: string, password: string) {
  try {
    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Generate JWT token
export function generateToken(user: any): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// For server-side route protection
export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return user;
}

// For admin route protection
export async function requireAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (user.role !== 'ADMIN' && user.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Admin access required' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return user;
}

// Export getSession as default for compatibility
export { getSession as getServerSession }; 