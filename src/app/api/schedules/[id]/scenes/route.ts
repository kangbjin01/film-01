import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/schedules/[id]/scenes - 일촬표의 모든 씬 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: scheduleId } = await context.params;
    
    const scenes = await prisma.scene.findMany({
      where: { scheduleId },
      orderBy: { order: 'asc' },
    });
    
    const formatted = scenes.map(s => ({
      id: s.id,
      scheduleId: s.scheduleId,
      order: s.order,
      sceneNumber: s.sceneNumber,
      timeOfDay: s.timeOfDay,
      locationType: s.locationType,
      startTime: s.startTime,
      endTime: s.endTime,
      estimatedDuration: s.estimatedDuration,
      location: s.location,
      description: s.description,
      mainCharacters: s.mainCharacters,
      remarks: s.remarks,
      cuts: s.cuts,
      status: s.status,
      created: s.createdAt.toISOString(),
      updated: s.updatedAt.toISOString(),
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch scenes:', error);
    return NextResponse.json({ error: 'Failed to fetch scenes' }, { status: 500 });
  }
}

// POST /api/schedules/[id]/scenes - 새 씬 생성
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: scheduleId } = await context.params;
    const body = await request.json();
    
    const scene = await prisma.scene.create({
      data: {
        scheduleId,
        order: body.order,
        sceneNumber: body.sceneNumber,
        timeOfDay: body.timeOfDay || 'D',
        locationType: body.locationType || 'I',
        startTime: body.startTime || '09:00',
        endTime: body.endTime || '10:00',
        estimatedDuration: body.estimatedDuration || 60,
        location: body.location || '',
        description: body.description || '',
        mainCharacters: body.mainCharacters || [],
        remarks: body.remarks,
        cuts: body.cuts || [],
        status: body.status || 'PENDING',
      },
    });
    
    const formatted = {
      id: scene.id,
      scheduleId: scene.scheduleId,
      order: scene.order,
      sceneNumber: scene.sceneNumber,
      timeOfDay: scene.timeOfDay,
      locationType: scene.locationType,
      startTime: scene.startTime,
      endTime: scene.endTime,
      estimatedDuration: scene.estimatedDuration,
      location: scene.location,
      description: scene.description,
      mainCharacters: scene.mainCharacters,
      remarks: scene.remarks,
      cuts: scene.cuts,
      status: scene.status,
      created: scene.createdAt.toISOString(),
      updated: scene.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Failed to create scene:', error);
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}

