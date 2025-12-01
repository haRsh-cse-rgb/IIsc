import { NextRequest, NextResponse } from 'next/server';
import { Hall } from '@/lib/server/models/Hall';
import { connectDatabase } from '@/lib/server/database';
import { requireRole } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDatabase();

    const user = requireRole(request, 'admin');
    const body = await request.json();

    const hall = await Hall.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(hall);
    await createAuditLog(request, response, user, 'update', 'hall', params.id, body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update hall error:', error);
    return NextResponse.json(
      { error: 'Failed to update hall' },
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
    const hall = await Hall.findByIdAndDelete(params.id);

    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ message: 'Hall deleted successfully' });
    await createAuditLog(request, response, user, 'delete', 'hall', params.id, {});
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete hall error:', error);
    return NextResponse.json(
      { error: 'Failed to delete hall' },
      { status: 500 }
    );
  }
}

