import { NextRequest, NextResponse } from 'next/server';
import { Complaint } from '@/lib/server/models/Complaint';
import { User } from '@/lib/server/models/User';
import { connectDatabase } from '@/lib/server/database';
import { requireAuth, requireRole, getAuthUser } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';
import { emitSocketEvent } from '@/lib/server/socket';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(complaints);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get complaints error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    const body = await request.json();

    if (!body.category || !body.title || !body.description) {
      return NextResponse.json(
        { error: 'Category, title, and description are required' },
        { status: 400 }
      );
    }

    const complaint = await Complaint.create(body);

    await emitSocketEvent('complaint:new', complaint);

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Create complaint error:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}

