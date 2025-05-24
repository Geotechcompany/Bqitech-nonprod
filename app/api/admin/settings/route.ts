import { NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;

    // Get all Clerk users and find admin by email
    const clerk = await clerkClient();
    const clerkUsers = await clerk.users.getUserList({
      emailAddress: [userEmail],
    });

    const clerkUser = clerkUsers.data[0];
    if (!clerkUser) {
      return new NextResponse('User not found in Clerk', { status: 404 });
    }

    // Check if user has admin role in Clerk metadata
    const isAdmin = clerkUser.publicMetadata.role === 'admin';
    if (!isAdmin) {
      return new NextResponse('Unauthorized - Admin access required', { status: 401 });
    }

    // Get the user from database using Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    const settings = await request.json();

    // Update settings and notification preferences in a transaction
    await prisma.$transaction([
      prisma.userSettings.upsert({
        where: { userId: dbUser.id },
        update: {
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          autoLogout: settings.autoLogout,
          tableRowsPerPage: settings.tableRowsPerPage,
          sidebarCollapsed: settings.sidebarCollapsed,
        },
        create: {
          userId: dbUser.id,
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          autoLogout: settings.autoLogout,
          tableRowsPerPage: settings.tableRowsPerPage,
          sidebarCollapsed: settings.sidebarCollapsed,
        },
      }),
      prisma.notificationPreference.upsert({
        where: { userId: dbUser.id },
        update: { emailEnabled: settings.emailNotifications },
        create: {
          userId: dbUser.id,
          emailEnabled: settings.emailNotifications,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 