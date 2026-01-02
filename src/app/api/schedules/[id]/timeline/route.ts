import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/schedules/[id]/timeline - 일촬표의 모든 타임라인 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: scheduleId } = await context.params;
    
    const timeline = await prisma.timelineItem.findMany({
      where: { scheduleId },
      orderBy: { order: 'asc' },
    });
    
    const formatted = timeline.map(t => ({
      id: t.id,
      scheduleId: t.scheduleId,
      order: t.order,
      time: t.time,
      endTime: t.endTime,
      title: t.title,
      description: t.description,
      type: t.type,
      created: t.createdAt.toISOString(),
      updated: t.updatedAt.toISOString(),
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

// POST /api/schedules/[id]/timeline - 새 타임라인 항목 생성
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: scheduleId } = await context.params;
    const body = await request.json();
    
    const item = await prisma.timelineItem.create({
      data: {
        scheduleId,
        order: body.order,
        time: body.time,
        endTime: body.endTime,
        title: body.title,
        description: body.description,
        type: body.type || 'OTHER',
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
    
    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Failed to create timeline item:', error);
    return NextResponse.json({ error: 'Failed to create timeline item' }, { status: 500 });
  }
}

