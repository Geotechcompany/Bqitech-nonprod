import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/user';
import { UserSettings } from '@/models/userSettings';
import { NotificationPreference } from '@/models/notificationPreference';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    // Get authenticated user from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email })
      .select('_id role')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // First cast to unknown, then to the correct type
    const userRole = (user as unknown as { role: string }).role;

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' }, 
        { status: 401 }
      );
    }

    const settings = await request.json();

    // Add proper type casting
    const userId = (user as { _id: string })._id;

    // Update settings and notification preferences
    await Promise.all([
      UserSettings.findOneAndUpdate(
        { userId },
        {
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          autoLogout: settings.autoLogout,
          tableRowsPerPage: settings.tableRowsPerPage,
          sidebarCollapsed: settings.sidebarCollapsed,
        },
        { upsert: true, new: true }
      ),
      NotificationPreference.findOneAndUpdate(
        { userId: userId },
        { emailEnabled: settings.emailNotifications },
        { upsert: true, new: true }
      )
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 