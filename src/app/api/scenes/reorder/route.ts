import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/scenes/reorder - 씬 순서 재정렬
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenes } = body; // [{ id, order }, ...]
    
    // 트랜잭션으로 모든 순서 업데이트
    await prisma.$transaction(
      scenes.map((scene: { id: string; order: number }) =>
        prisma.scene.update({
          where: { id: scene.id },
          data: { order: scene.order },
        })
      )
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder scenes:', error);
    return NextResponse.json({ error: 'Failed to reorder scenes' }, { status: 500 });
  }
}

