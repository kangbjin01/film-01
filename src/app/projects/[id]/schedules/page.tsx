'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  ArrowLeft, 
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Trash2,
  Copy,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProjectStore } from '@/stores/projectStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import type { DailyScheduleFormData } from '@/types';
import { formatDateKorean, normalizeTime } from '@/lib/timeUtils';
import { cn } from '@/lib/utils';

export default function SchedulesListPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { currentProject, fetchProject } = useProjectStore();
  const { schedules, fetchSchedules, createSchedule, deleteSchedule, isLoading } = useScheduleStore();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<Partial<DailyScheduleFormData>>({
    gatherTime: '06:00',
    shootingEndTime: '22:00',
    shootingLocationName: '',
    shootingLocation: '',
  });
  
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchSchedules(projectId);
    }
  }, [projectId, fetchProject, fetchSchedules]);
  
  const handleCreate = async () => {
    if (!selectedDate) return;
    
    // 다음 회차 계산
    const nextEpisode = schedules.length > 0 
      ? Math.max(...schedules.map(s => s.episode)) + 1 
      : 1;
    
    const data: DailyScheduleFormData = {
      projectId,
      shootingDate: format(selectedDate, 'yyyy-MM-dd'),
      episode: nextEpisode,
      gatherTime: formData.gatherTime || '06:00',
      shootingEndTime: formData.shootingEndTime || '22:00',
      shootingLocation: formData.shootingLocation || '',
      shootingLocationName: formData.shootingLocationName || '',
      gatherLocation: '',
      gatherLocationName: '',
    };
    
    try {
      const schedule = await createSchedule(data);
      setIsCreateOpen(false);
      router.push(`/projects/${projectId}/schedules/${schedule.id}`);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('정말 이 일촬표를 삭제하시겠습니까?')) {
      try {
        await deleteSchedule(id);
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };
  
  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentProject?.title || '프로젝트'}
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">일촬표 목록</h1>
              <p className="text-muted-foreground mt-1">
                {currentProject?.title}의 촬영 일정을 관리합니다
              </p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  새 일촬표
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>새 일촬표 만들기</DialogTitle>
                  <DialogDescription>
                    촬영일과 기본 정보를 입력하세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>촬영일 *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? formatDateKorean(selectedDate.toISOString()) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gatherTime">집합시간</Label>
                      <Input
                        id="gatherTime"
                        placeholder="06:00"
                        value={formData.gatherTime}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          gatherTime: normalizeTime(e.target.value) 
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">예상 종료</Label>
                      <Input
                        id="endTime"
                        placeholder="22:00"
                        value={formData.shootingEndTime}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          shootingEndTime: normalizeTime(e.target.value) 
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="locationName">촬영장소 이름</Label>
                    <Input
                      id="locationName"
                      placeholder="예: 국동아파트"
                      value={formData.shootingLocationName}
                      onChange={(e) => setFormData({ ...formData, shootingLocationName: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="location">촬영장소 주소</Label>
                    <Input
                      id="location"
                      placeholder="예: 서울 동작구 동작대로 29길 119"
                      value={formData.shootingLocation}
                      onChange={(e) => setFormData({ ...formData, shootingLocation: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleCreate} disabled={!selectedDate}>
                    만들기
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Schedules List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 w-1/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">일촬표가 없습니다</h3>
              <p className="text-muted-foreground text-center mb-6">
                첫 번째 일촬표를 만들어 촬영 일정을 관리하세요
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                새 일촬표 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/projects/${projectId}/schedules/${schedule.id}`}
                      className="flex-1"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold">
                          D{schedule.episode}
                        </div>
                        <div>
                          <CardTitle className="text-lg hover:text-primary transition-colors">
                            {schedule.episode}회차 촬영
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateKorean(schedule.shootingDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {schedule.gatherTime} ~ {schedule.shootingEndTime}
                            </span>
                            {schedule.shootingLocationName && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {schedule.shootingLocationName}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${projectId}/schedules/${schedule.id}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            편집
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          복제
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}





