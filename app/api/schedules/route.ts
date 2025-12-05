import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Schedule } from '@/lib/server/models/Schedule';
import { Hall, hallSchema } from '@/lib/server/models/Hall';
import { connectDatabase } from '@/lib/server/database';
import { requireRole, getAuthUser } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';
import { emitSocketEvent } from '@/lib/server/socket';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    // Ensure Hall model is registered on the connection
    // This is necessary in Next.js due to module loading order issues
    if (!mongoose.connection.models.Hall) {
      // Re-register the Hall model on the connection if it doesn't exist
      mongoose.connection.model('Hall', hallSchema);
    }

    const { searchParams } = new URL(request.url);
    const hall = searchParams.get('hall');
    const status = searchParams.get('status');
    const day = searchParams.get('day');
    const tags = searchParams.get('tags');

    const query: any = {};
    if (hall) query.hall = hall;
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',') };

    if (day) {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const schedules = await Schedule.find(query)
      .populate('hall', 'name code location')
      .sort({ startTime: 1 })
      .lean();

    // Ensure isPlenary is always included (default to false if missing)
    const schedulesWithPlenary = schedules.map((schedule: any) => ({
      ...schedule,
      isPlenary: Boolean(schedule.isPlenary)
    }));

    // Log to verify isPlenary is included
    if (schedulesWithPlenary.length > 0) {
      console.log('Sample schedule isPlenary:', schedulesWithPlenary[0]?.isPlenary);
    }

    // Convert to plain objects using JSON serialization
    const serialized = JSON.parse(JSON.stringify(schedulesWithPlenary));

    console.log(`Returning ${serialized.length} schedules`);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    // Ensure Hall model is registered on the connection
    if (!mongoose.connection.models.Hall) {
      mongoose.connection.model('Hall', hallSchema);
    }

    const user = requireRole(request, 'admin');
    const body = await request.json();

    if (!body.title || !body.authors || !body.hall || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Explicitly include isPlenary field - ensure it's always a boolean
    // Handle both true and false values explicitly (can be boolean, string, or number from form data)
    const isPlenaryValue = Boolean(
      body.isPlenary === true || 
      body.isPlenary === 'true' || 
      body.isPlenary === 1 || 
      body.isPlenary === '1'
    );
    
    const scheduleData: any = {
      title: body.title,
      authors: body.authors,
      hall: body.hall,
      startTime: body.startTime,
      endTime: body.endTime,
      status: body.status || 'upcoming',
      tags: body.tags || [],
      slideLink: body.slideLink,
      description: body.description,
      isPlenary: Boolean(isPlenaryValue), // Always explicitly set, even if false
    };
    
    console.log('Creating schedule - body.isPlenary:', body.isPlenary, 'typeof:', typeof body.isPlenary);
    console.log('Creating schedule with data:', JSON.stringify(scheduleData, null, 2));
    const scheduleResult = await Schedule.create(scheduleData);
    
    // Handle both single document and array cases
    const schedule = Array.isArray(scheduleResult) ? scheduleResult[0] : scheduleResult;
    const populated = await schedule.populate('hall', 'name code location');
    
    // Get fresh from DB to ensure all fields are included
    const savedSchedule = await Schedule.findById(schedule._id).lean();
    console.log('Saved schedule from DB - isPlenary:', savedSchedule?.isPlenary, 'Full object keys:', Object.keys(savedSchedule || {}));
    
    const plainSchedule = populated.toObject ? populated.toObject() : populated;
    
    // Ensure isPlenary is always included in response (use saved value from DB)
    if (plainSchedule && savedSchedule) {
      plainSchedule.isPlenary = Boolean(savedSchedule.isPlenary);
      console.log('Returning schedule with isPlenary:', plainSchedule.isPlenary);
    } else if (plainSchedule) {
      plainSchedule.isPlenary = Boolean(plainSchedule.isPlenary);
    }

    await emitSocketEvent('schedule:new', plainSchedule);

    const response = NextResponse.json(plainSchedule, { status: 201 });
    await createAuditLog(request, response, user, 'create', 'schedule', populated._id.toString(), body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

