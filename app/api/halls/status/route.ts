import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Hall, hallSchema } from '@/lib/server/models/Hall';
import { Schedule } from '@/lib/server/models/Schedule';
import { connectDatabase } from '@/lib/server/database';

// Disable caching for this route - it needs to return fresh data every time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    // Ensure Hall model is registered on the connection
    if (!mongoose.connection.models.Hall) {
      mongoose.connection.model('Hall', hallSchema);
    }

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

    // Add cache control headers to prevent Vercel from caching
    const response = NextResponse.json(hallStatuses, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    return response;
  } catch (error) {
    console.error('Get hall status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hall status' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

