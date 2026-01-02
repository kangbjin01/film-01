import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/casts/[id] - 캐스트 수정
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const cast = await prisma.cast.update({
      where: { id },
      data: {
        role: body.role,
        actorName: body.actorName,
        phone: body.phone,
      },
    });
    
    const formatted = {
      id: cast.id,
      projectId: cast.projectId,
      role: cast.role,
      actorName: cast.actorName,
      phone: cast.phone,
      created: cast.createdAt.toISOString(),
      updated: cast.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to update cast:', error);
    return NextResponse.json({ error: 'Failed to update cast' }, { status: 500 });
  }
}

// DELETE /api/casts/[id] - 캐스트 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    await prisma.cast.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete cast:', error);
    return NextResponse.json({ error: 'Failed to delete cast' }, { status: 500 });
  }
}

