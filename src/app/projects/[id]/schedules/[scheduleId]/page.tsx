'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  FileDown,
  Sun,
  Sunrise,
  Sunset,
  Cloud,
  Thermometer,
  Droplets,
  Plus,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  User,
  Users,
  ExternalLink
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectStore } from '@/stores/projectStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { SceneTable } from '@/components/schedule/SceneTable';
import { TimelineEditor } from '@/components/schedule/TimelineEditor';
import { formatDateKorean } from '@/lib/timeUtils';
import { exportScheduleToPdf, downloadPdf } from '@/lib/exportPdf';
import { exportScheduleToExcel, downloadExcel } from '@/lib/exportExcel';
import { TimeInput } from '@/components/ui/time-input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function ScheduleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const scheduleId = params.scheduleId as string;
  
  const { currentProject, staff, casts, fetchProject, fetchStaff, fetchCasts } = useProjectStore();
  const { 
    currentSchedule, 
    scenes,
    timeline,
    fetchSchedule, 
    updateSchedule,
    isLoading 
  } = useScheduleStore();
  
  const [localSchedule, setLocalSchedule] = useState(currentSchedule);
  const [hasChanges, setHasChanges] = useState(false);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
  
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchStaff(projectId);
      fetchCasts(projectId);
    }
    if (scheduleId) {
      fetchSchedule(scheduleId);
    }
  }, [projectId, scheduleId, fetchProject, fetchSchedule, fetchStaff, fetchCasts]);
  
  useEffect(() => {
    if (currentSchedule) {
      setLocalSchedule(currentSchedule);
    }
  }, [currentSchedule]);
  
  const handleFieldChange = (field: string, value: string | number) => {
    if (!localSchedule) return;
    setLocalSchedule({ ...localSchedule, [field]: value });
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    if (!localSchedule || !hasChanges) return;
    
    try {
      await updateSchedule(scheduleId, localSchedule);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };
  
  const handleExportPdf = async (
    orientation: 'portrait' | 'landscape' = 'landscape',
    mode: 'basic' | 'detailed' = 'basic'
  ) => {
    if (!currentSchedule || !currentProject) return;
    
    try {
      const blob = await exportScheduleToPdf({
        schedule: currentSchedule,
        scenes,
        timeline,
        staff,
        casts,
        projectTitle: currentProject.title,
        orientation,
        mode,
      });
      const modeLabel = mode === 'basic' ? '기본' : '상세';
      downloadPdf(blob, `일촬표_${currentProject.title}_${currentSchedule.episode}회차_${modeLabel}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('PDF 내보내기에 실패했습니다.');
    }
  };
  
  const handleExportExcel = () => {
    if (!currentSchedule || !currentProject) return;
    
    try {
      const blob = exportScheduleToExcel({
        schedule: currentSchedule,
        scenes,
        timeline,
        staff,
        projectTitle: currentProject.title,
      });
      downloadExcel(blob, `일촬표_${currentProject.title}_${currentSchedule.episode}회차.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Excel 내보내기에 실패했습니다.');
    }
  };
  
  if (isLoading || !currentSchedule || !localSchedule) {
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
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/projects/${projectId}/schedules`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold">
                {currentProject?.title} - {localSchedule.episode}회차
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatDateKorean(localSchedule.shootingDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-primary border-primary">
                변경사항 있음
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileDown className="w-4 h-4" />
                  내보내기
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleExportPdf('landscape', 'basic')}>
                  📄 기본 PDF (촬영 씬 + 일정)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPdf('landscape', 'detailed')}>
                  📋 상세 PDF (세부진행 + 캐스트 포함)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  📊 Excel로 내보내기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Info Card - Collapsible */}
            <Collapsible open={isBasicInfoOpen} onOpenChange={setIsBasicInfoOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">기본 정보</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {!isBasicInfoOpen && (
                          <span className="text-sm">
                            {localSchedule.gatherTime} 집합 · {localSchedule.shootingLocationName || '장소 미정'}
                          </span>
                        )}
                        {isBasicInfoOpen ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {/* 시간 정보 */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">시간</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="gatherTime" className="text-xs">집합시간</Label>
                            <TimeInput
                              value={localSchedule.gatherTime}
                              onChange={(value) => handleFieldChange('gatherTime', value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="endTime" className="text-xs">종료시간</Label>
                            <TimeInput
                              value={localSchedule.shootingEndTime}
                              onChange={(value) => handleFieldChange('shootingEndTime', value)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* 장소 정보 */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">촬영장소</h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="locationName" className="text-xs">장소명</Label>
                            <Input
                              id="locationName"
                              value={localSchedule.shootingLocationName}
                              onChange={(e) => handleFieldChange('shootingLocationName', e.target.value)}
                              placeholder="예: 국동아파트"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="location" className="text-xs">주소</Label>
                            <Input
                              id="location"
                              value={localSchedule.shootingLocation}
                              onChange={(e) => handleFieldChange('shootingLocation', e.target.value)}
                              placeholder="상세 주소"
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* 날씨 정보 */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">날씨</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                              <Cloud className="w-3 h-3" />
                              날씨
                            </Label>
                            <Input
                              value={localSchedule.weatherCondition || ''}
                              onChange={(e) => handleFieldChange('weatherCondition', e.target.value)}
                              placeholder="맑음"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                              <Droplets className="w-3 h-3" />
                              강수확률
                            </Label>
                            <Input
                              type="number"
                              value={localSchedule.rainProbability || ''}
                              onChange={(e) => handleFieldChange('rainProbability', parseFloat(e.target.value))}
                              placeholder="0"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              최저/최고
                            </Label>
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                value={localSchedule.minTemp || ''}
                                onChange={(e) => handleFieldChange('minTemp', parseFloat(e.target.value))}
                                placeholder="25"
                                className="h-9"
                              />
                              <Input
                                type="number"
                                value={localSchedule.maxTemp || ''}
                                onChange={(e) => handleFieldChange('maxTemp', parseFloat(e.target.value))}
                                placeholder="32"
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 일출/일몰 */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">일출/일몰</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                              <Sunrise className="w-3 h-3" />
                              일출
                            </Label>
                            <TimeInput
                              value={localSchedule.sunrise || ''}
                              onChange={(value) => handleFieldChange('sunrise', value)}
                              placeholder="05:46"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                              <Sunset className="w-3 h-3" />
                              일몰
                            </Label>
                            <TimeInput
                              value={localSchedule.sunset || ''}
                              onChange={(value) => handleFieldChange('sunset', value)}
                              placeholder="19:28"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
            
            {/* Tabs for Scenes, Timeline, etc */}
            <Tabs defaultValue="scenes" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="scenes">촬영 씬</TabsTrigger>
                <TabsTrigger value="timeline">전체일정</TabsTrigger>
                <TabsTrigger value="staff">스태프</TabsTrigger>
                <TabsTrigger value="cast">캐스트</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scenes" className="mt-6">
                <SceneTable 
                  scheduleId={scheduleId} 
                  gatherTime={localSchedule.gatherTime}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <TimelineEditor scheduleId={scheduleId} />
              </TabsContent>
              
              <TabsContent value="staff" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        스태프 연락처
                        <Badge variant="secondary">{staff.length}명</Badge>
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => router.push(`/projects/${projectId}/staff`)}
                      >
                        <ExternalLink className="w-4 h-4" />
                        스태프 관리
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {staff.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="mb-3">등록된 스태프가 없습니다</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/projects/${projectId}/staff`)}
                        >
                          스태프 등록하러 가기
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {staff.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{member.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {member.position}
                                </Badge>
                              </div>
                              {member.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {member.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="cast" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        캐스트 리스트
                        <Badge variant="secondary">{casts.length}명</Badge>
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => router.push(`/projects/${projectId}/cast`)}
                      >
                        <ExternalLink className="w-4 h-4" />
                        캐스트 관리
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {casts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="mb-3">등록된 캐스트가 없습니다</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/projects/${projectId}/cast`)}
                        >
                          캐스트 등록하러 가기
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {casts.map((cast) => (
                          <div
                            key={cast.id}
                            className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {cast.role}
                                </Badge>
                                <span className="font-medium text-sm">{cast.actorName}</span>
                              </div>
                              {cast.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {cast.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

