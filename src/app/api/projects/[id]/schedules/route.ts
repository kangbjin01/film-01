import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/schedules - 프로젝트의 모든 일촬표 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    
    const schedules = await prisma.dailySchedule.findMany({
      where: { projectId },
      orderBy: { shootingDate: 'desc' },
    });
    
    const formatted = schedules.map(s => ({
      id: s.id,
      projectId: s.projectId,
      shootingDate: s.shootingDate.toISOString().split('T')[0],
      episode: s.episode,
      gatherTime: s.gatherTime,
      shootingEndTime: s.shootingEndTime,
      shootingLocation: s.shootingLocation,
      shootingLocationName: s.shootingLocationName,
      gatherLocation: s.gatherLocation,
      gatherLocationName: s.gatherLocationName,
      weatherCondition: s.weatherCondition,
      minTemp: s.minTemp,
      maxTemp: s.maxTemp,
      rainProbability: s.rainProbability,
      sunrise: s.sunrise,
      sunset: s.sunset,
      notes: s.notes,
      created: s.createdAt.toISOString(),
      updated: s.updatedAt.toISOString(),
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// POST /api/projects/[id]/schedules - 새 일촬표 생성
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    
    const schedule = await prisma.dailySchedule.create({
      data: {
        projectId,
        shootingDate: new Date(body.shootingDate),
        episode: body.episode,
        gatherTime: body.gatherTime || '07:00',
        shootingEndTime: body.shootingEndTime || '19:00',
        shootingLocation: body.shootingLocation || '',
        shootingLocationName: body.shootingLocationName || '',
        gatherLocation: body.gatherLocation || '',
        gatherLocationName: body.gatherLocationName || '',
        weatherCondition: body.weatherCondition,
        minTemp: body.minTemp,
        maxTemp: body.maxTemp,
        rainProbability: body.rainProbability,
        sunrise: body.sunrise,
        sunset: body.sunset,
        notes: body.notes,
      },
    });
    
    const formatted = {
      id: schedule.id,
      projectId: schedule.projectId,
      shootingDate: schedule.shootingDate.toISOString().split('T')[0],
      episode: schedule.episode,
      gatherTime: schedule.gatherTime,
      shootingEndTime: schedule.shootingEndTime,
      shootingLocation: schedule.shootingLocation,
      shootingLocationName: schedule.shootingLocationName,
      gatherLocation: schedule.gatherLocation,
      gatherLocationName: schedule.gatherLocationName,
      weatherCondition: schedule.weatherCondition,
      minTemp: schedule.minTemp,
      maxTemp: schedule.maxTemp,
      rainProbability: schedule.rainProbability,
      sunrise: schedule.sunrise,
      sunset: schedule.sunset,
      notes: schedule.notes,
      created: schedule.createdAt.toISOString(),
      updated: schedule.updatedAt.toISOString(),
    };
    
    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}

