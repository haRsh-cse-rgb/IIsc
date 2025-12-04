import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/lib/server/models/Event';
import { connectDatabase } from '@/lib/server/database';
import { requireRole } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';
import { getSocketIO } from '@/lib/server/socket';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();

    const event = await Event.findById(params.id).lean();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Convert _id to string for proper JSON serialization
    const serialized = {
      ...event,
      _id: event._id.toString()
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
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

    const user = requireRole(request, 'admin');
    const body = await request.json();

    // Validate that type is not empty or "other" if provided
    if (body.type !== undefined) {
      if (body.type === 'other' || !body.type.trim()) {
        return NextResponse.json(
          { error: 'Invalid event type. Please select a valid type or enter a custom type.' },
          { status: 400 }
        );
      }
    }

    const event = await Event.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).lean();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Convert _id to string for proper JSON serialization
    const serialized = {
      ...event,
      _id: event._id.toString()
    };

    const io = getSocketIO();
    if (io) {
      io.emit('event:update', serialized);
    }

    const response = NextResponse.json(serialized);
    await createAuditLog(request, response, user, 'update', 'event', params.id, body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
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
    const event = await Event.findByIdAndDelete(params.id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const io = getSocketIO();
    if (io) {
      io.emit('event:delete', { id: params.id });
    }

    const response = NextResponse.json({ message: 'Event deleted successfully' });
    await createAuditLog(request, response, user, 'delete', 'event', params.id, {});
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

