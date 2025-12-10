import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { TechnicalSession } from '@/lib/server/models/TechnicalSession';
import { Hall, hallSchema } from '@/lib/server/models/Hall';
import { connectDatabase } from '@/lib/server/database';
import { requireRole } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();
    if (!mongoose.connection.models.Hall) {
      mongoose.connection.model('Hall', hallSchema);
    }
    const session = await TechnicalSession.findById(params.id)
      .populate('hall', 'name code location')
      .lean();

    if (!session) {
      return NextResponse.json({ error: 'Technical session not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(session)));
  } catch (error) {
    console.error('Get technical session error:', error);
    return NextResponse.json({ error: 'Failed to fetch technical session' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();
    if (!mongoose.connection.models.Hall) {
      mongoose.connection.model('Hall', hallSchema);
    }
    const user = requireRole(request, 'admin');
    const body = await request.json();

    const updateData: any = {
      title: body.title,
      code: body.code,
      day: body.day,
      hall: body.hall,
      chairName: body.chairName || '',
      chairTitle: body.chairTitle || '',
      description: body.description || '',
    };

    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);

    const session = await TechnicalSession.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('hall', 'name code location')
      .lean();

    if (!session) {
      return NextResponse.json({ error: 'Technical session not found' }, { status: 404 });
    }

    const response = NextResponse.json(JSON.parse(JSON.stringify(session)));
    await createAuditLog(request, response, user, 'update', 'technicalSession', params.id, body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update technical session error:', error);
    return NextResponse.json({ error: 'Failed to update technical session' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();
    const user = requireRole(request, 'admin');

    const session = await TechnicalSession.findByIdAndDelete(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Technical session not found' }, { status: 404 });
    }

    const response = NextResponse.json({ message: 'Technical session deleted successfully' });
    await createAuditLog(request, response, user, 'delete', 'technicalSession', params.id, {});
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete technical session error:', error);
    return NextResponse.json({ error: 'Failed to delete technical session' }, { status: 500 });
  }
}

