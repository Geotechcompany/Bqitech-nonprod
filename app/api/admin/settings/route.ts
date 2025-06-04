import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/user';
import { UserSettings } from '@/models/userSettings';
import { NotificationPreference } from '@/models/notificationPreference';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Add interface for user settings
interface UserSettings {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  autoLogout?: number;
  tableRowsPerPage?: number;
  sidebarCollapsed?: boolean;
  profile?: {
    avatarUrl?: string;
  };
}

export async function PUT(req: Request) {
  try {
    const { db } = await connectToDatabase();
    const settings = await req.json();

    // Add validation
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { message: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Add proper update logic
    const result = await db.collection('settings').updateOne(
      { _id: new ObjectId('global_settings') },
      { $set: settings },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      updatedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { message: error.message || 'Database operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
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

    const userRole = (user as unknown as { role: string }).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' }, 
        { status: 401 }
      );
    }

    const userId = (user as { _id: string })._id;
    
    // Get existing settings
    const userSettings = await UserSettings.findOne({ userId }).lean();
    const notificationPrefs = await NotificationPreference.findOne({ userId }).lean();

    return NextResponse.json({
      emailNotifications: (userSettings as UserSettings)?.emailNotifications ?? true,
      pushNotifications: (userSettings as UserSettings)?.pushNotifications ?? true,
      autoLogout: (userSettings as UserSettings)?.autoLogout ?? 30,
      tableRowsPerPage: (userSettings as UserSettings)?.tableRowsPerPage ?? 10,
      sidebarCollapsed: (userSettings as UserSettings)?.sidebarCollapsed ?? false,
      profile: {
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.image
      }
    });

  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 