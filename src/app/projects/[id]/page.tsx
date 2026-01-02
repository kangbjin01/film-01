'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Film, 
  Plus, 
  ArrowLeft,
  Clock,
  MapPin
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProjectStore } from '@/stores/projectStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { PROJECT_STATUS_LABELS } from '@/types';
import { formatDateKorean } from '@/lib/timeUtils';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { currentProject, staff, casts, fetchProject, isLoading } = useProjectStore();
  const { schedules, fetchSchedules } = useScheduleStore();
  
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchSchedules(projectId);
    }
  }, [projectId, fetchProject, fetchSchedules]);
  
  if (isLoading || !currentProject) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back button & Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            프로젝트 목록
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{currentProject.title}</h1>
                <Badge variant="secondary">
                  {PROJECT_STATUS_LABELS[currentProject.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {currentProject.director && `감독: ${currentProject.director}`}
                {currentProject.director && currentProject.producer && ' · '}
                {currentProject.producer && `PD: ${currentProject.producer}`}
                {(currentProject.director || currentProject.producer) && currentProject.assistantDirector && ' · '}
                {currentProject.assistantDirector && `조연출: ${currentProject.assistantDirector}`}
              </p>
            </div>
            
            <Link href={`/projects/${projectId}/schedules/new`}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                새 일촬표
              </Button>
            </Link>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">일촬표</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">
                등록된 촬영일
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">스태프</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground">
                등록된 스태프
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">캐스트</CardTitle>
              <Film className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{casts.length}</div>
              <p className="text-xs text-muted-foreground">
                등록된 배우
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Schedules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">일촬표 목록</h2>
            <Link href={`/projects/${projectId}/schedules`}>
              <Button variant="ghost" size="sm">
                전체 보기
              </Button>
            </Link>
          </div>
          
          {schedules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">일촬표가 없습니다</h3>
                <p className="text-muted-foreground text-center mb-4">
                  첫 번째 일촬표를 만들어 촬영 일정을 관리하세요
                </p>
                <Link href={`/projects/${projectId}/schedules/new`}>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    새 일촬표 만들기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.slice(0, 6).map((schedule) => (
                <Link 
                  key={schedule.id} 
                  href={`/projects/${projectId}/schedules/${schedule.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {schedule.episode}회차
                        </CardTitle>
                        <Badge variant="outline">
                          {formatDateKorean(schedule.shootingDate)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {schedule.gatherTime} 집합
                        </span>
                        {schedule.shootingLocationName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {schedule.shootingLocationName}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}





