'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreVertical, Edit2, Trash2, Copy, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Scene, Cut } from '@/types';
import { TIME_OF_DAY_LABELS, LOCATION_TYPE_LABELS } from '@/types';
import { formatDurationShort } from '@/lib/timeUtils';
import { cn } from '@/lib/utils';

interface SceneRowProps {
  scene: Scene;
  index: number;
  onEdit: (scene: Scene) => void;
  onDelete: (id: string) => void;
  onInlineUpdate?: (id: string, data: Partial<Scene>) => void;
  onQuickAdd?: () => void;
}

const TIME_OF_DAY_COLORS: Record<string, string> = {
  M: 'bg-amber-100 text-amber-700',
  D: 'bg-sky-100 text-sky-700',
  E: 'bg-orange-100 text-orange-700',
  N: 'bg-indigo-100 text-indigo-700',
};

// 인라인 편집 Input 컴포넌트
function InlineInput({
  value,
  onChange,
  onSave,
  onCancel,
  onEnterAdd,
  type = 'text',
  placeholder,
  className,
  min,
  suffix,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEnterAdd?: () => void;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  min?: number;
  suffix?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
      if (e.ctrlKey && onEnterAdd) {
        setTimeout(() => onEnterAdd(), 100);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };
  
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onSave}
        className={cn("h-7 text-sm px-2", className)}
        placeholder={placeholder}
        min={min}
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}

// iOS 스타일 휠 피커 컴포넌트
function WheelPicker({
  value,
  onChange,
  onClose,
  min = 1,
  max = 99,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  min?: number;
  max?: number;
}) {
  const [currentValue, setCurrentValue] = useState(parseInt(value, 10) || 1);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemHeight = 36;
  const visibleItems = 5;
  
  // 휠 이벤트 처리 (페이지 스크롤 방지)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY > 0 ? 1 : -1;
      setCurrentValue(prev => {
        const next = prev + direction;
        if (next < min) return min;
        if (next > max) return max;
        return next;
      });
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [min, max]);
  
  // currentValue 변경 시 inputValue도 동기화
  useEffect(() => {
    setInputValue(String(currentValue));
  }, [currentValue]);
  
  // 키보드 이벤트 (화살표)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // input에 포커스가 있으면 화살표 키 처리 안함
      if (document.activeElement === inputRef.current) return;
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentValue(prev => Math.max(min, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentValue(prev => Math.min(max, prev + 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onChange(String(currentValue));
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentValue, max, min, onChange, onClose]);
  
  const getVisibleNumbers = () => {
    const numbers = [];
    const halfVisible = Math.floor(visibleItems / 2);
    for (let i = -halfVisible; i <= halfVisible; i++) {
      const num = currentValue + i;
      numbers.push(num);
    }
    return numbers;
  };
  
  const handleSelect = () => {
    onChange(String(currentValue));
    onClose();
  };
  
  const handleItemClick = (num: number) => {
    if (num >= min && num <= max) {
      setCurrentValue(num);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      setCurrentValue(num);
    }
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const num = parseInt(inputValue, 10);
      if (!isNaN(num) && num >= min && num <= max) {
        onChange(String(num));
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <div className="p-3 select-none" onClick={(e) => e.stopPropagation()}>
      {/* 키보드 입력 필드 */}
      <div className="mb-3">
        <Input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="h-9 text-center text-lg font-mono font-bold"
          placeholder="CUT 번호"
          min={min}
          max={max}
        />
      </div>
      
      <div className="text-xs text-center text-muted-foreground mb-2">
        휠 또는 ↑↓로 조절
      </div>
      
      {/* 휠 피커 */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden cursor-ns-resize"
        style={{ height: itemHeight * visibleItems }}
      >
        {/* 선택 영역 하이라이트 */}
        <div 
          className="absolute left-0 right-0 bg-primary/10 border-y border-primary/30 pointer-events-none z-10"
          style={{ 
            top: itemHeight * Math.floor(visibleItems / 2),
            height: itemHeight 
          }}
        />
        
        {/* 위쪽 그라데이션 */}
        <div 
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background to-transparent pointer-events-none z-20"
          style={{ height: itemHeight * 1.5 }}
        />
        
        {/* 아래쪽 그라데이션 */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pointer-events-none z-20"
          style={{ height: itemHeight * 1.5 }}
        />
        
        {/* 숫자 목록 */}
        <div className="flex flex-col items-center">
          {getVisibleNumbers().map((num, idx) => {
            const isCenter = idx === Math.floor(visibleItems / 2);
            const distance = Math.abs(idx - Math.floor(visibleItems / 2));
            const isValid = num >= min && num <= max;
            
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-center font-mono transition-all duration-150 cursor-pointer",
                  isCenter && "text-xl font-bold text-primary",
                  !isCenter && distance === 1 && "text-base text-muted-foreground",
                  !isCenter && distance >= 2 && "text-sm text-muted-foreground/50",
                  !isValid && "opacity-30"
                )}
                style={{ height: itemHeight, width: 80 }}
                onClick={() => handleItemClick(num)}
              >
                {isValid ? num : ''}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 확인 버튼 */}
      <Button
        type="button"
        size="sm"
        className="w-full mt-3"
        onClick={handleSelect}
      >
        C{currentValue} 선택
      </Button>
    </div>
  );
}

// CUT 행 컴포넌트
function CutRow({
  cut,
  cutIndex,
  scene,
  onUpdateCut,
  onDeleteCut,
  onAddCut,
  isLast,
}: {
  cut: Cut;
  cutIndex: number;
  scene: Scene;
  onUpdateCut: (cutId: string, data: Partial<Cut>) => void;
  onDeleteCut: (cutId: string) => void;
  onAddCut: () => void;
  isLast: boolean;
}) {
  const [editingField, setEditingField] = useState<'cutNumber' | 'description' | 'estimatedDuration' | 'remarks' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isCutPickerOpen, setIsCutPickerOpen] = useState(false);
  
  const startEditing = (field: typeof editingField, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };
  
  const saveEdit = () => {
    if (!editingField) return;
    
    let updateData: Partial<Cut> = {};
    switch (editingField) {
      case 'cutNumber':
        updateData = { cutNumber: editValue };
        break;
      case 'description':
        updateData = { description: editValue };
        break;
      case 'estimatedDuration':
        const duration = parseInt(editValue, 10);
        if (!isNaN(duration) && duration > 0) {
          updateData = { estimatedDuration: duration };
        }
        break;
      case 'remarks':
        updateData = { remarks: editValue };
        break;
    }
    
    if (Object.keys(updateData).length > 0) {
      onUpdateCut(cut.id, updateData);
    }
    setEditingField(null);
    setEditValue('');
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
      // Ctrl+Enter로 새 컷 추가
      if (e.ctrlKey) {
        setTimeout(() => onAddCut(), 100);
      }
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setEditValue('');
    }
  };
  
  const handleCutNumberChange = (newValue: string) => {
    onUpdateCut(cut.id, { cutNumber: newValue });
  };
  
  return (
    <div className="grid grid-cols-12 gap-2 px-3 py-2 rounded-lg bg-card border hover:bg-accent/30 transition-colors group">
      {/* 순서 & 드래그 핸들 */}
      <div className="col-span-1 flex items-center gap-2 pl-6">
        <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
        <span className="text-xs text-muted-foreground">{cutIndex + 1}</span>
      </div>
      
      {/* CUT 번호 - 휠 피커로 변경 */}
      <div className="col-span-1 flex items-center">
        <Popover open={isCutPickerOpen} onOpenChange={setIsCutPickerOpen}>
          <PopoverTrigger asChild>
            <div className="cursor-pointer hover:bg-primary/10 rounded px-1 -mx-1 transition-colors">
              <Badge variant="outline" className="text-xs font-mono hover:border-primary">
                C{cut.cutNumber}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" side="bottom">
            <WheelPicker
              value={cut.cutNumber}
              onChange={handleCutNumberChange}
              onClose={() => setIsCutPickerOpen(false)}
              min={1}
              max={99}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* 시간대 (씬에서 상속) */}
      <div className="col-span-1 flex items-center gap-1">
        <Badge 
          variant="secondary" 
          className={cn("text-xs px-1.5", TIME_OF_DAY_COLORS[scene.timeOfDay])}
        >
          {TIME_OF_DAY_LABELS[scene.timeOfDay]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {LOCATION_TYPE_LABELS[scene.locationType]}
        </span>
      </div>
      
      {/* 소요시간 */}
      <div className="col-span-1 flex items-center">
        {editingField === 'estimatedDuration' ? (
          <InlineInput
            type="number"
            value={editValue}
            onChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
            className="w-14"
            min={1}
            suffix="분"
          />
        ) : (
          <span
            className="text-xs text-muted-foreground cursor-pointer hover:text-primary hover:underline"
            onClick={() => startEditing('estimatedDuration', cut.estimatedDuration.toString())}
          >
            {formatDurationShort(cut.estimatedDuration)}
          </span>
        )}
      </div>
      
      {/* 장소 (씬에서 상속) - 축소 */}
      <div className="col-span-1 flex items-center">
        <span className="text-sm truncate text-muted-foreground">{scene.location || '-'}</span>
      </div>
      
      {/* 컷 설명 (촬영 내용) - 확대 */}
      <div className="col-span-4 flex items-center">
        {editingField === 'description' ? (
          <InlineInput
            value={editValue}
            onChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
            placeholder="촬영 내용"
          />
        ) : (
          <div
            className={cn(
              "cursor-pointer hover:bg-primary/10 rounded px-1 -mx-1 transition-colors text-sm w-full",
              !cut.description && "text-muted-foreground/50 italic"
            )}
            onClick={() => startEditing('description', cut.description)}
          >
            {cut.description || '촬영 내용 입력'}
          </div>
        )}
      </div>
      
      {/* 비고 & 액션 버튼 */}
      <div className="col-span-2 flex items-center justify-between gap-1">
        {editingField === 'remarks' ? (
          <InlineInput
            value={editValue}
            onChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
            className="w-full"
            placeholder="비고"
          />
        ) : (
          <span
            className={cn(
              "text-xs cursor-pointer hover:bg-primary/10 rounded px-1 -mx-1 transition-colors truncate flex-1",
              !cut.remarks && "text-muted-foreground/50 italic"
            )}
            onClick={() => startEditing('remarks', cut.remarks || '')}
          >
            {cut.remarks || '비고'}
          </span>
        )}
        
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
            onClick={() => startEditing('description', cut.description)}
            title="컷 편집"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={() => onDeleteCut(cut.id)}
            title="컷 삭제"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SceneRow({ scene, index, onEdit, onDelete, onInlineUpdate, onQuickAdd }: SceneRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingSceneNumber, setEditingSceneNumber] = useState(false);
  const [sceneNumberValue, setSceneNumberValue] = useState(scene.sceneNumber);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const cuts = scene.cuts || [];
  
  // 컷 추가
  const handleAddCut = () => {
    if (!onInlineUpdate) return;
    const newCut: Cut = {
      id: crypto.randomUUID(),
      cutNumber: String(cuts.length + 1),
      description: '',
      estimatedDuration: 10,
      remarks: '',
    };
    onInlineUpdate(scene.id, { cuts: [...cuts, newCut] });
  };
  
  // 컷 업데이트
  const handleUpdateCut = (cutId: string, data: Partial<Cut>) => {
    if (!onInlineUpdate) return;
    const updatedCuts = cuts.map(c => c.id === cutId ? { ...c, ...data } : c);
    onInlineUpdate(scene.id, { cuts: updatedCuts });
  };
  
  // 컷 삭제
  const handleDeleteCut = (cutId: string) => {
    if (!onInlineUpdate) return;
    const updatedCuts = cuts.filter(c => c.id !== cutId);
    onInlineUpdate(scene.id, { cuts: updatedCuts });
  };
  
  // 씬 번호 저장
  const handleSaveSceneNumber = () => {
    if (onInlineUpdate && sceneNumberValue.trim()) {
      onInlineUpdate(scene.id, { sceneNumber: sceneNumberValue.trim() });
    }
    setEditingSceneNumber(false);
  };
  
  // 총 컷 소요시간
  const totalCutDuration = cuts.reduce((acc, cut) => acc + cut.estimatedDuration, 0);
  
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50")}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* S# 그룹 헤더 */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/70 rounded-t-lg border border-b-0 group">
          <CollapsibleTrigger asChild>
            <button className="p-0.5 hover:bg-muted rounded">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          
          {/* S# 번호 */}
          {editingSceneNumber ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <span className="font-semibold">S#</span>
              <Input
                value={sceneNumberValue}
                onChange={(e) => setSceneNumberValue(e.target.value)}
                onBlur={handleSaveSceneNumber}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSceneNumber();
                  if (e.key === 'Escape') setEditingSceneNumber(false);
                }}
                className="h-7 w-16 text-sm"
                autoFocus
              />
            </div>
          ) : (
            <span 
              className="font-semibold text-sm cursor-pointer hover:text-primary"
              onClick={() => {
                setSceneNumberValue(scene.sceneNumber);
                setEditingSceneNumber(true);
              }}
            >
              S#{scene.sceneNumber}
            </span>
          )}
          
          <Badge 
            variant="secondary" 
            className={cn("text-xs", TIME_OF_DAY_COLORS[scene.timeOfDay])}
          >
            {TIME_OF_DAY_LABELS[scene.timeOfDay]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {LOCATION_TYPE_LABELS[scene.locationType]}
          </span>
          
          <span className="text-sm text-muted-foreground">
            {scene.location}
          </span>
          
          <div className="flex-1" />
          
          <Badge variant="outline" className="text-xs">
            {cuts.length}컷
          </Badge>
          
          {totalCutDuration > 0 && (
            <span className="text-xs text-muted-foreground">
              총 {formatDurationShort(totalCutDuration)}
            </span>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddCut}>
                <Plus className="w-4 h-4 mr-2" />
                컷 추가
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(scene)}>
                <Edit2 className="w-4 h-4 mr-2" />
                씬 상세 편집
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                씬 복제
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(scene.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                씬 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* CUT 행들 */}
        <CollapsibleContent>
          <div className="space-y-1 pl-4 border-l-2 border-primary/30 ml-4">
            {cuts.length === 0 ? (
              <div 
                className="px-3 py-4 text-center text-muted-foreground text-sm border rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={handleAddCut}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                첫 번째 컷 추가하기
              </div>
            ) : (
              <>
                {cuts.map((cut, cutIndex) => (
                  <CutRow
                    key={cut.id}
                    cut={cut}
                    cutIndex={cutIndex}
                    scene={scene}
                    onUpdateCut={handleUpdateCut}
                    onDeleteCut={handleDeleteCut}
                    onAddCut={handleAddCut}
                    isLast={cutIndex === cuts.length - 1}
                  />
                ))}
                
                {/* 컷 추가 버튼 */}
                <div 
                  className="px-3 py-2 rounded-lg border border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer text-center"
                  onClick={handleAddCut}
                >
                  <span className="text-xs text-muted-foreground hover:text-primary">
                    <Plus className="w-3 h-3 inline mr-1" />
                    컷 추가 (Ctrl+Enter)
                  </span>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
