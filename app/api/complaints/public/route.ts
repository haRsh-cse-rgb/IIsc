import { NextRequest, NextResponse } from 'next/server';
import { Complaint } from '@/lib/server/models/Complaint';
import { connectDatabase } from '@/lib/server/database';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    const complaints = await Complaint.find()
      .select('category priority status createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Get public complaints error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

