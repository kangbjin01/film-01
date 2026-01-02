'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScheduleStore } from '@/stores/scheduleStore';
import { SceneRow } from './SceneRow';
import { SceneModal } from './SceneModal';
import type { Scene, SceneFormData } from '@/types';
import { calculateTimeFromDuration } from '@/lib/timeUtils';

interface SceneTableProps {
  scheduleId: string;
  gatherTime: string;
}

export function SceneTable({ scheduleId, gatherTime }: SceneTableProps) {
  const { 
    scenes, 
    createScene, 
    updateScene, 
    deleteScene, 
    reorderScenes,
    setScenes
  } = useScheduleStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // 시간 자동 계산
  useEffect(() => {
    if (scenes.length === 0) return;
    
    let currentTime = gatherTime;
    const updatedScenes = scenes.map((scene) => {
      const startTime = currentTime;
      const endTime = calculateTimeFromDuration(currentTime, scene.estimatedDuration);
      currentTime = endTime;
      
      return {
        ...scene,
        startTime,
        endTime,
      };
    });
    
    // 시간이 변경된 경우에만 업데이트
    const hasTimeChanges = updatedScenes.some((scene, index) => 
      scene.startTime !== scenes[index].startTime || 
      scene.endTime !== scenes[index].endTime
    );
    
    if (hasTimeChanges) {
      setScenes(updatedScenes);
    }
  }, [gatherTime, scenes.length]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id);
      const newIndex = scenes.findIndex((s) => s.id === over.id);
      
      const newScenes = arrayMove(scenes, oldIndex, newIndex).map((scene, index) => ({
        ...scene,
        order: index,
      }));
      
      reorderScenes(newScenes);
    }
  };
  
  const handleCreate = async (data: Omit<SceneFormData, 'scheduleId' | 'order'>) => {
    const order = scenes.length;
    const lastScene = scenes[scenes.length - 1];
    const startTime = lastScene ? lastScene.endTime : gatherTime;
    const endTime = calculateTimeFromDuration(startTime, data.estimatedDuration);
    
    await createScene({
      ...data,
      scheduleId,
      order,
      startTime,
      endTime,
    });
    
    setIsModalOpen(false);
  };
  
  const handleUpdate = async (id: string, data: Partial<SceneFormData>) => {
    await updateScene(id, data);
    setEditingScene(null);
  };
  
  const handleInlineUpdate = async (id: string, data: Partial<SceneFormData>) => {
    await updateScene(id, data);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('이 씬을 삭제하시겠습니까?')) {
      await deleteScene(id);
    }
  };
  
  const handleEdit = (scene: Scene) => {
    setEditingScene(scene);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingScene(null);
  };
  
  // 빠른 씬 추가 (기본값으로 생성)
  const handleQuickAdd = async () => {
    const order = scenes.length;
    const lastScene = scenes[scenes.length - 1];
    const startTime = lastScene ? lastScene.endTime : gatherTime;
    const nextSceneNumber = lastScene 
      ? String(parseInt(lastScene.sceneNumber) + 1 || scenes.length + 1)
      : '1';
    
    const defaultData = {
      scheduleId,
      order,
      sceneNumber: nextSceneNumber,
      timeOfDay: lastScene?.timeOfDay || 'D' as const,
      locationType: lastScene?.locationType || 'I' as const,
      startTime,
      endTime: calculateTimeFromDuration(startTime, 30),
      estimatedDuration: 30,
      location: '',
      description: '',
      mainCharacters: [],
      remarks: '',
      cuts: [{
        id: crypto.randomUUID(),
        cutNumber: '1',
        description: '',
        estimatedDuration: 0,
      }],
      status: 'PENDING' as const,
    };
    
    await createScene(defaultData);
  };
  
  // 총 촬영 시간 계산
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.estimatedDuration, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">촬영 씬</CardTitle>
            <Badge variant="secondary">{scenes.length}개</Badge>
            {totalDuration > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                총 {totalHours}시간 {totalMins > 0 ? `${totalMins}분` : ''}
              </Badge>
            )}
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            씬 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {scenes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">등록된 씬이 없습니다</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              첫 번째 씬 추가하기
            </Button>
          </div>
        ) : (
          <>
            {/* Table Header - CUT 행용 */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground mb-2 ml-4 pl-6">
              <div className="col-span-1">순서</div>
              <div className="col-span-1">CUT</div>
              <div className="col-span-1">시간대</div>
              <div className="col-span-1">소요</div>
              <div className="col-span-2">장소</div>
              <div className="col-span-3">촬영내용</div>
              <div className="col-span-2">비고</div>
            </div>
            
            {/* Sortable Rows */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={scenes.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {scenes.map((scene, index) => (
                    <SceneRow
                      key={scene.id}
                      scene={scene}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onInlineUpdate={handleInlineUpdate}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            {/* 빠른 씬 추가 버튼 - 마지막 행 아래 */}
            <div 
              className="mt-2 px-3 py-3 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
              onClick={handleQuickAdd}
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">새 씬 추가 (클릭 또는 Ctrl+Enter)</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      {/* Scene Modal */}
      <SceneModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        scene={editingScene}
        onSubmit={editingScene 
          ? (data) => handleUpdate(editingScene.id, data)
          : handleCreate
        }
      />
    </Card>
  );
}

