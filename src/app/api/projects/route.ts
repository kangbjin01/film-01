import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/projects - 모든 프로젝트 조회
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // 프론트엔드 형식에 맞게 변환
    const formatted = projects.map(p => ({
      id: p.id,
      title: p.title,
      director: p.director,
      producer: p.producer,
      assistantDirector: p.assistantDirector,
      description: p.description,
      startDate: p.startDate?.toISOString().split('T')[0],
      endDate: p.endDate?.toISOString().split('T')[0],
      status: p.status,
      created: p.createdAt.toISOString(),
      updated: p.updatedAt.toISOString(),
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - 새 프로젝트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const project = await prisma.project.create({
      data: {
        title: body.title,
        director: body.director,
        producer: body.producer,
        assistantDirector: body.assistantDirector,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || 'PREP',
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
    
    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

