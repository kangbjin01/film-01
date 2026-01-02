import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/staff - 프로젝트의 모든 스태프 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    
    const staff = await prisma.staff.findMany({
      where: { projectId },
      orderBy: [{ department: 'asc' }, { position: 'asc' }],
    });
    
    const formatted = staff.map(s => ({
      id: s.id,
      projectId: s.projectId,
      name: s.name,
      department: s.department,
      position: s.position,
      phone: s.phone,
      email: s.email,
      created: s.createdAt.toISOString(),
      updated: s.updatedAt.toISOString(),
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST /api/projects/[id]/staff - 새 스태프 생성
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    
    const staff = await prisma.staff.create({
      data: {
        projectId,
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
    
    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Failed to create staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

