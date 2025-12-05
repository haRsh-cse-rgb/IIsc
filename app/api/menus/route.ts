import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Menu, menuSchema } from '@/lib/server/models/Menu';
import { connectDatabase } from '@/lib/server/database';
import { requireRole } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/audit';
import { emitSocketEvent } from '@/lib/server/socket';

export async function GET(request: NextRequest) {
  try {
    await connectDatabase();

    // Ensure Menu model is registered on the connection
    if (!mongoose.connection.models.Menu) {
      mongoose.connection.model('Menu', menuSchema);
    }

    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const mealType = searchParams.get('mealType');

    const query: any = {};
    if (day) query.day = parseInt(day);
    if (mealType) query.mealType = mealType;

    const menus = await Menu.find(query)
      .sort({ day: 1, mealType: 1 });

    // Convert to plain objects using JSON serialization
    const serialized = JSON.parse(JSON.stringify(menus));

    console.log(`Returning ${serialized.length} menu items`);
    return NextResponse.json(serialized);
  } catch (error: any) {
    console.error('Get menus error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch menus',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDatabase();

    // Ensure Menu model is registered on the connection
    if (!mongoose.connection.models.Menu) {
      mongoose.connection.model('Menu', menuSchema);
    }

    const user = requireRole(request, 'admin', 'volunteer');
    const body = await request.json();

    if (!body.day || !body.mealType || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Day, mealType, and items array are required' },
        { status: 400 }
      );
    }

    // Check if menu already exists for this day and mealType
    const existing = await Menu.findOne({ day: body.day, mealType: body.mealType });
    if (existing) {
      // Update existing menu
      const menu = await Menu.findByIdAndUpdate(
        existing._id,
        { items: body.items, description: body.description },
        { new: true, runValidators: true }
      );

      await emitSocketEvent('menu:update', menu);

      const response = NextResponse.json(menu, { status: 200 });
      await createAuditLog(request, response, user, 'update', 'menu', menu._id.toString(), body);
      return response;
    } else {
      // Create new menu
      const menuResult = await Menu.create(body);
      
      // Handle both single document and array cases
      const menu = Array.isArray(menuResult) ? menuResult[0] : menuResult;

      await emitSocketEvent('menu:new', menu);

      const response = NextResponse.json(menu, { status: 201 });
      await createAuditLog(request, response, user, 'create', 'menu', menu._id.toString(), body);
      return response;
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Menu already exists for this day and meal type' },
        { status: 400 }
      );
    }
    console.error('Create/Update menu error:', error);
    return NextResponse.json(
      { error: 'Failed to create/update menu' },
      { status: 500 }
    );
  }
}

