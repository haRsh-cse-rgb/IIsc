import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Schedule } from '@/lib/server/models/Schedule';
import { Hall, hallSchema } from '@/lib/server/models/Hall';
import { connectDatabase } from '@/lib/server/database';
import { requireRole } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';
import { emitSocketEvent } from '@/lib/server/socket';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();

    // Ensure Hall model is registered on the connection
    if (!mongoose.connection.models.Hall) {
      mongoose.connection.model('Hall', hallSchema);
    }

    const schedule = await Schedule.findById(params.id)
      .populate('hall', 'name code location')
      .lean();

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Ensure isPlenary is always included (default to false if missing)
    const scheduleWithPlenary = {
      ...schedule,
      isPlenary: Boolean(schedule.isPlenary)
    };

    return NextResponse.json(scheduleWithPlenary);
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();

    // Ensure Hall model is registered on the connection
    if (!mongoose.connection.models.Hall) {
      mongoose.connection.model('Hall', hallSchema);
    }

    const user = requireRole(request, 'admin');
    const body = await request.json();

    // Explicitly include isPlenary field - ensure it's always a boolean
    // Handle both true and false values explicitly (can be boolean, string, or number from form data)
    const isPlenaryValue = Boolean(
      body.isPlenary === true || 
      body.isPlenary === 'true' || 
      body.isPlenary === 1 || 
      body.isPlenary === '1'
    );
    
    // Parse date-time strings - should now be ISO strings with timezone from client
    let startTime: Date | undefined;
    let endTime: Date | undefined;
    
    if (body.startTime) {
      if (typeof body.startTime === 'string') {
        // Check if it's an ISO string with timezone
        if (body.startTime.includes('Z') || body.startTime.match(/[+-]\d{2}:\d{2}$/)) {
          startTime = new Date(body.startTime);
        } else {
          // No timezone - parse as local time (backward compatibility)
          const [datePart, timePart] = body.startTime.split('T');
          if (datePart && timePart) {
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second = 0] = timePart.split(':').map(Number);
            startTime = new Date(year, month - 1, day, hour, minute, second || 0);
          } else {
            startTime = new Date(body.startTime);
          }
        }
      } else {
        startTime = new Date(body.startTime);
      }
    }
    
    if (body.endTime) {
      if (typeof body.endTime === 'string') {
        if (body.endTime.includes('Z') || body.endTime.match(/[+-]\d{2}:\d{2}$/)) {
          endTime = new Date(body.endTime);
        } else {
          const [datePart, timePart] = body.endTime.split('T');
          if (datePart && timePart) {
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second = 0] = timePart.split(':').map(Number);
            endTime = new Date(year, month - 1, day, hour, minute, second || 0);
          } else {
            endTime = new Date(body.endTime);
          }
        }
      } else {
        endTime = new Date(body.endTime);
      }
    }
    
    // Build update data - always include isPlenary explicitly
    const updateData: any = {
      ...body,
      isPlenary: Boolean(isPlenaryValue), // Always explicitly set, even if false
    };
    
    // Override with parsed dates if they were provided
    if (startTime) {
      updateData.startTime = startTime;
    }
    if (endTime) {
      updateData.endTime = endTime;
    }
    
    console.log('Updating schedule - body.isPlenary:', body.isPlenary, 'typeof:', typeof body.isPlenary);
    console.log('Updating schedule with data:', JSON.stringify(updateData, null, 2));
    
    const schedule = await Schedule.findByIdAndUpdate(
      params.id,
      updateData, // Explicitly include isPlenary in the update
      { new: true, runValidators: true }
    )
      .populate('hall', 'name code location')
      .lean();
    
    // Verify it was saved
    console.log('Updated schedule isPlenary value:', schedule?.isPlenary);

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    await emitSocketEvent('schedule:update', schedule);

    const response = NextResponse.json(schedule);
    await createAuditLog(request, response, user, 'update', 'schedule', params.id, body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();

    const user = requireRole(request, 'admin');
    const schedule = await Schedule.findByIdAndDelete(params.id);

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    await emitSocketEvent('schedule:delete', { id: params.id });

    const response = NextResponse.json({ message: 'Schedule deleted successfully' });
    await createAuditLog(request, response, user, 'delete', 'schedule', params.id, {});
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}

