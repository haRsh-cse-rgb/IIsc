import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Hall, hallSchema } from '@/lib/server/models/Hall';
import { Schedule } from '@/lib/server/models/Schedule';
import { connectDatabase } from '@/lib/server/database';
import { requireRole } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    // Ensure Hall model is registered on the connection
    if (!mongoose.connection.models.Hall) {
      mongoose.connection.model('Hall', hallSchema);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    if (status === 'true') {
      const halls = await Hall.find();
      const now = new Date();

      const hallStatuses = await Promise.all(
        halls.map(async (hall) => {
          const current = await Schedule.findOne({
            hall: hall._id,
            startTime: { $lte: now },
            endTime: { $gt: now },
            status: { $ne: 'cancelled' }
          })
            .populate('hall', 'name code location')
            .lean();

          const next = await Schedule.findOne({
            hall: hall._id,
            startTime: { $gt: now },
            status: { $ne: 'cancelled' }
          })
            .populate('hall', 'name code location')
            .sort({ startTime: 1 })
            .lean();

          return {
            hall: {
              id: hall._id.toString(),
              name: hall.name,
              code: hall.code,
              location: hall.location
            },
            current: current ? {
              ...current,
              _id: current._id.toString(),
              hall: current.hall ? {
                ...current.hall,
                _id: current.hall._id?.toString()
              } : current.hall
            } : null,
            next: next ? {
              ...next,
              _id: next._id.toString(),
              hall: next.hall ? {
                ...next.hall,
                _id: next.hall._id?.toString()
              } : next.hall
            } : null,
            timeRemaining: current
              ? Math.max(0, Math.floor((new Date(current.endTime).getTime() - now.getTime()) / 60000))
              : null
          };
        })
      );

      return NextResponse.json(hallStatuses);
    }

    const halls = await Hall.find().sort({ code: 1 });
    // Convert to plain objects using JSON serialization
    const serialized = JSON.parse(JSON.stringify(halls));
    console.log(`Returning ${serialized.length} halls`);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Get halls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch halls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const user = requireRole(request, 'admin');
    const body = await request.json();

    const hallResult = await Hall.create(body);
    
    // Handle both single document and array cases
    const hall = Array.isArray(hallResult) ? hallResult[0] : hallResult;

    const response = NextResponse.json(hall, { status: 201 });
    await createAuditLog(request, response, user, 'create', 'hall', hall._id.toString(), body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Create hall error:', error);
    return NextResponse.json(
      { error: 'Failed to create hall' },
      { status: 500 }
    );
  }
}

