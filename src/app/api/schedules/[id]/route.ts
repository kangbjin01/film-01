import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/schedules/[id] - 단일 일촬표 조회 (씬, 타임라인 포함)
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    const schedule = await prisma.dailySchedule.findUnique({
      where: { id },
      include: {
        scenes: { orderBy: { order: 'asc' } },
        timeline: { orderBy: { order: 'asc' } },
      },
    });
    
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
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
      scenes: schedule.scenes.map(s => ({
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
      })),
      timeline: schedule.timeline.map(t => ({
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
      })),
    };
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

// PATCH /api/schedules/[id] - 일촬표 수정
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const schedule = await prisma.dailySchedule.update({
      where: { id },
      data: {
        shootingDate: body.shootingDate ? new Date(body.shootingDate) : undefined,
        episode: body.episode,
        gatherTime: body.gatherTime,
        shootingEndTime: body.shootingEndTime,
        shootingLocation: body.shootingLocation,
        shootingLocationName: body.shootingLocationName,
        gatherLocation: body.gatherLocation,
        gatherLocationName: body.gatherLocationName,
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
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

// DELETE /api/schedules/[id] - 일촬표 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    await prisma.dailySchedule.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}

