import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/scenes/[id] - 씬 수정
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const scene = await prisma.scene.update({
      where: { id },
      data: {
        order: body.order,
        sceneNumber: body.sceneNumber,
        timeOfDay: body.timeOfDay,
        locationType: body.locationType,
        startTime: body.startTime,
        endTime: body.endTime,
        estimatedDuration: body.estimatedDuration,
        location: body.location,
        description: body.description,
        mainCharacters: body.mainCharacters,
        remarks: body.remarks,
        cuts: body.cuts,
        status: body.status,
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
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to update scene:', error);
    return NextResponse.json({ error: 'Failed to update scene' }, { status: 500 });
  }
}

// DELETE /api/scenes/[id] - 씬 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    await prisma.scene.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete scene:', error);
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}

