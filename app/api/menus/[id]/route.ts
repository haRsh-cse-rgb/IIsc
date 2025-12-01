import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Menu, menuSchema } from '@/lib/server/models/Menu';
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

    // Ensure Menu model is registered on the connection
    if (!mongoose.connection.models.Menu) {
      mongoose.connection.model('Menu', menuSchema);
    }

    const menu = await Menu.findById(params.id);

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    const serialized = JSON.parse(JSON.stringify(menu));
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Get menu error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
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

    // Ensure Menu model is registered on the connection
    if (!mongoose.connection.models.Menu) {
      mongoose.connection.model('Menu', menuSchema);
    }

    const user = requireRole(request, 'admin', 'volunteer');
    const body = await request.json();

    const menu = await Menu.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    const io = getSocketIO();
    if (io) {
      io.emit('menu:update', menu);
    }

    const response = NextResponse.json(menu);
    await createAuditLog(request, response, user, 'update', 'menu', params.id, body);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update menu error:', error);
    return NextResponse.json(
      { error: 'Failed to update menu' },
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

    // Ensure Menu model is registered on the connection
    if (!mongoose.connection.models.Menu) {
      mongoose.connection.model('Menu', menuSchema);
    }

    const user = requireRole(request, 'admin');
    const menu = await Menu.findByIdAndDelete(params.id);

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    const io = getSocketIO();
    if (io) {
      io.emit('menu:delete', { id: params.id });
    }

    const response = NextResponse.json({ message: 'Menu deleted successfully' });
    await createAuditLog(request, response, user, 'delete', 'menu', params.id, {});
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete menu error:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}

