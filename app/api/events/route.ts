import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/lib/server/models/Event';
import { connectDatabase } from '@/lib/server/database';
import { requireRole } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';
import { emitSocketEvent } from '@/lib/server/socket';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming') === 'true';

    const query: any = {};
    if (type) query.type = type;
    if (upcoming) {
      query.startTime = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .sort({ startTime: 1 })
      .lean();

    // Convert _id to string for proper JSON serialization
    const serialized = events.map((event: any) => ({
      ...event,
      _id: event._id.toString()
    }));

    console.log(`Returning ${serialized.length} events`);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const user = requireRole(request, 'admin');
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.type || !body.description || !body.venue || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields', details: { 
          title: !body.title, 
          type: !body.type, 
          description: !body.description, 
          venue: !body.venue, 
          startTime: !body.startTime, 
          endTime: !body.endTime 
        }},
        { status: 400 }
      );
    }

    // Validate that type is not empty or "other"
    if (body.type === 'other' || !body.type.trim()) {
      return NextResponse.json(
        { error: 'Invalid event type. Please select a valid type or enter a custom type.' },
        { status: 400 }
      );
    }

    const eventResult = await Event.create(body);
    
    // Handle both single document and array cases
    const event = Array.isArray(eventResult) ? eventResult[0] : eventResult;
    const plainEvent = event.toObject ? event.toObject() : event;
    const serialized = {
      ...plainEvent,
      _id: plainEvent._id.toString()
    };

    await emitSocketEvent('event:new', serialized);

    const response = NextResponse.json(serialized, { status: 201 });
    await createAuditLog(request, response, user, 'create', 'event', serialized._id, body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create event error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}

