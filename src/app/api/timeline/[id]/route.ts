import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/timeline/[id] - 타임라인 항목 수정
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const item = await prisma.timelineItem.update({
      where: { id },
      data: {
        order: body.order,
        time: body.time,
        endTime: body.endTime,
        title: body.title,
        description: body.description,
        type: body.type,
      },
    });
    
    const formatted = {
      id: item.id,
      scheduleId: item.scheduleId,
      order: item.order,
      time: item.time,
      endTime: item.endTime,
      title: item.title,
      description: item.description,
      type: item.type,
      created: item.createdAt.toISOString(),
      updated: item.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to update timeline item:', error);
    return NextResponse.json({ error: 'Failed to update timeline item' }, { status: 500 });
  }
}

// DELETE /api/timeline/[id] - 타임라인 항목 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    await prisma.timelineItem.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete timeline item:', error);
    return NextResponse.json({ error: 'Failed to delete timeline item' }, { status: 500 });
  }
}

