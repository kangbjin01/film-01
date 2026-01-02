import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/staff/[id] - 스태프 수정
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name: body.name,
        department: body.department,
        position: body.position,
        phone: body.phone,
        email: body.email,
      },
    });
    
    const formatted = {
      id: staff.id,
      projectId: staff.projectId,
      name: staff.name,
      department: staff.department,
      position: staff.position,
      phone: staff.phone,
      email: staff.email,
      created: staff.createdAt.toISOString(),
      updated: staff.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to update staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

// DELETE /api/staff/[id] - 스태프 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    await prisma.staff.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}

