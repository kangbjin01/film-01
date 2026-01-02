import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/casts - 프로젝트의 모든 캐스트 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    
    const casts = await prisma.cast.findMany({
      where: { projectId },
      orderBy: { role: 'asc' },
    });
    
    const formatted = casts.map(c => ({
      id: c.id,
      projectId: c.projectId,
      role: c.role,
      actorName: c.actorName,
      phone: c.phone,
      created: c.createdAt.toISOString(),
      updated: c.updatedAt.toISOString(),
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch casts:', error);
    return NextResponse.json({ error: 'Failed to fetch casts' }, { status: 500 });
  }
}

// POST /api/projects/[id]/casts - 새 캐스트 생성
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    
    const cast = await prisma.cast.create({
      data: {
        projectId,
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
    
    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Failed to create cast:', error);
    return NextResponse.json({ error: 'Failed to create cast' }, { status: 500 });
  }
}

