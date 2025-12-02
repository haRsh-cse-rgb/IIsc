import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Announcement, IAnnouncement } from '@/lib/server/models/Announcement';
import { User, userSchema } from '@/lib/server/models/User';
import { connectDatabase } from '@/lib/server/database';
import { requireRole, getAuthUser } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';
import { getSocketIO } from '@/lib/server/socket';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    // Ensure User model is registered on the connection
    // This is necessary in Next.js due to module loading order issues
    if (!mongoose.connection.models.User) {
      // Re-register the User model on the connection if it doesn't exist
      mongoose.connection.model('User', userSchema);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Convert to plain objects using JSON serialization
    const serialized = JSON.parse(JSON.stringify(announcements));

    console.log(`Returning ${serialized.length} announcements`);
    return NextResponse.json(serialized);
  } catch (error: any) {
    console.error('Get announcements error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch announcements',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const user = requireRole(request, 'admin', 'volunteer');
    const body = await request.json();

    if (!body.title || !body.type || !body.content) {
      return NextResponse.json(
        { error: 'Title, type, and content are required' },
        { status: 400 }
      );
    }

    const announcementResult = await Announcement.create({
      ...body,
      createdBy: user.userId
    });
    
    // Handle both single document and array cases
    const announcement = Array.isArray(announcementResult) 
      ? announcementResult[0] 
      : announcementResult;

    const populated = await announcement.populate('createdBy', 'name email');
    const plainAnnouncement = populated.toObject ? populated.toObject() : populated;

    const io = getSocketIO();
    if (io) {
      io.emit('announcement:new', plainAnnouncement);
    }

    const response = NextResponse.json(plainAnnouncement, { status: 201 });
    await createAuditLog(request, response, user, 'create', 'announcement', populated._id.toString(), body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

