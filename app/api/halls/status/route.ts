import { NextRequest, NextResponse } from 'next/server';
import { Hall } from '@/lib/server/models/Hall';
import { Schedule } from '@/lib/server/models/Schedule';
import { connectDatabase } from '@/lib/server/database';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    const halls = await Hall.find();
    const now = new Date();

    const hallStatuses = await Promise.all(
      halls.map(async (hall) => {
        const current = await Schedule.findOne({
          hall: hall._id,
          startTime: { $lte: now },
          endTime: { $gt: now },
          status: { $ne: 'cancelled' }
        });

        const next = await Schedule.findOne({
          hall: hall._id,
          startTime: { $gt: now },
          status: { $ne: 'cancelled' }
        }).sort({ startTime: 1 });

        return {
          hall: {
            id: hall._id,
            name: hall.name,
            code: hall.code,
            location: hall.location
          },
          current: current || null,
          next: next || null,
          timeRemaining: current
            ? Math.max(0, Math.floor((current.endTime.getTime() - now.getTime()) / 60000))
            : null
        };
      })
    );

    return NextResponse.json(hallStatuses);
  } catch (error) {
    console.error('Get hall status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hall status' },
      { status: 500 }
    );
  }
}

