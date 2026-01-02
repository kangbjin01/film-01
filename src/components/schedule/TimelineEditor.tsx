'use client';

import { useState } from 'react';
import { Plus, Clock, Trash2, Edit2, Coffee, Utensils, Camera, Users, Truck, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useScheduleStore } from '@/stores/scheduleStore';
import type { TimelineItem, TimelineType, TimelineItemFormData } from '@/types';
import { TIMELINE_TYPE_LABELS } from '@/types';
import { normalizeTime } from '@/lib/timeUtils';
import { cn } from '@/lib/utils';

interface TimelineEditorProps {
  scheduleId: string;
}

const TYPE_ICONS: Record<TimelineType, React.ComponentType<{ className?: string }>> = {
  GATHER: Users,
  MEAL: Utensils,
  SHOOTING: Camera,
  BREAK: Coffee,
  WRAP: Truck,
  OTHER: Clock,
};

const TYPE_COLORS: Record<TimelineType, string> = {
  GATHER: 'bg-blue-100 text-blue-700 border-blue-200',
  MEAL: 'bg-amber-100 text-amber-700 border-amber-200',
  SHOOTING: 'bg-primary/10 text-primary border-primary/20',
  BREAK: 'bg-green-100 text-green-700 border-green-200',
  WRAP: 'bg-purple-100 text-purple-700 border-purple-200',
  OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
};

const TIMELINE_TEMPLATES = [
  { time: '06:30', title: '반출 인원 집합', type: 'GATHER' as TimelineType },
  { time: '07:00', title: '장비 반출', type: 'OTHER' as TimelineType },
  { time: '07:30', title: '전체 스태프 집합', type: 'GATHER' as TimelineType },
  { time: '08:00', title: '아침식사', type: 'MEAL' as TimelineType },
  { time: '12:00', title: '점심식사', type: 'MEAL' as TimelineType },
  { time: '18:00', title: '저녁식사', type: 'MEAL' as TimelineType },
  { time: '22:00', title: '바라시 (철수)', type: 'WRAP' as TimelineType },
];

export function TimelineEditor({ scheduleId }: TimelineEditorProps) {
  const { timeline, createTimelineItem, updateTimelineItem, deleteTimelineItem } = useScheduleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [formData, setFormData] = useState({
    time: '',
    endTime: '',
    title: '',
    description: '',
    type: 'OTHER' as TimelineType,
  });
  
  const handleOpenModal = (item?: TimelineItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        time: item.time,
        endTime: item.endTime || '',
        title: item.title,
        description: item.description || '',
        type: item.type,
      });
    } else {
      setEditingItem(null);
      setFormData({
        time: '',
        endTime: '',
        title: '',
        description: '',
        type: 'OTHER',
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSubmit = async () => {
    if (!formData.time || !formData.title) return;
    
    const data: TimelineItemFormData = {
      scheduleId,
      order: editingItem ? editingItem.order : timeline.length,
      time: formData.time,
      endTime: formData.endTime || undefined,
      title: formData.title,
      description: formData.description || undefined,
      type: formData.type,
    };
    
    if (editingItem) {
      await updateTimelineItem(editingItem.id, data);
    } else {
      await createTimelineItem(data);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      await deleteTimelineItem(id);
    }
  };
  
  const handleAddTemplate = async (template: typeof TIMELINE_TEMPLATES[0]) => {
    await createTimelineItem({
      scheduleId,
      order: timeline.length,
      time: template.time,
      title: template.title,
      type: template.type,
    });
  };
  
  // 시간순 정렬
  const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">전체일정</CardTitle>
            <Badge variant="secondary">{timeline.length}개</Badge>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  템플릿 추가
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {TIMELINE_TEMPLATES.map((template, i) => (
                  <DropdownMenuItem 
                    key={i}
                    onClick={() => handleAddTemplate(template)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {template.time} {template.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => handleOpenModal()} className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              일정 추가
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedTimeline.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">등록된 일정이 없습니다</p>
            <Button onClick={() => handleOpenModal()} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              첫 번째 일정 추가하기
            </Button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[52px] top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-3">
              {sortedTimeline.map((item) => {
                const Icon = TYPE_ICONS[item.type];
                return (
                  <div key={item.id} className="flex items-start gap-4 group">
                    {/* Time */}
                    <div className="w-12 text-right">
                      <span className="text-sm font-mono font-medium">{item.time}</span>
                    </div>
                    
                    {/* Dot */}
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background",
                      TYPE_COLORS[item.type]
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenModal(item)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className={cn("mt-2 text-xs", TYPE_COLORS[item.type])}
                      >
                        {TIMELINE_TYPE_LABELS[item.type]}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? '일정 수정' : '새 일정 추가'}</DialogTitle>
            <DialogDescription>
              촬영일의 일정을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">시작 시간 *</Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: normalizeTime(e.target.value) })}
                  placeholder="08:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">종료 시간</Label>
                <Input
                  id="endTime"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: normalizeTime(e.target.value) })}
                  placeholder="09:00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">일정명 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 전체 스태프 집합"
              />
            </div>
            
            <div className="space-y-2">
              <Label>일정 유형</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TimelineType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIMELINE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="상세 설명 (선택)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.time || !formData.title}
            >
              {editingItem ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}





