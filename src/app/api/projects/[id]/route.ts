import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/projects/[id] - 단일 프로젝트 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const formatted = {
      id: project.id,
      title: project.title,
      director: project.director,
      producer: project.producer,
      assistantDirector: project.assistantDirector,
      description: project.description,
      startDate: project.startDate?.toISOString().split('T')[0],
      endDate: project.endDate?.toISOString().split('T')[0],
      status: project.status,
      created: project.createdAt.toISOString(),
      updated: project.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PATCH /api/projects/[id] - 프로젝트 수정
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        director: body.director,
        producer: body.producer,
        assistantDirector: body.assistantDirector,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        status: body.status,
      },
    });
    
    const formatted = {
      id: project.id,
      title: project.title,
      director: project.director,
      producer: project.producer,
      assistantDirector: project.assistantDirector,
      description: project.description,
      startDate: project.startDate?.toISOString().split('T')[0],
      endDate: project.endDate?.toISOString().split('T')[0],
      status: project.status,
      created: project.createdAt.toISOString(),
      updated: project.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - 프로젝트 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    await prisma.project.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

