'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Scene, SceneFormData, TimeOfDay, LocationType, SceneStatus, Cut } from '@/types';
import { TIME_OF_DAY_LABELS, LOCATION_TYPE_LABELS } from '@/types';
import { parseDuration, formatDuration } from '@/lib/timeUtils';

interface SceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene?: Scene | null;
  onSubmit: (data: Omit<SceneFormData, 'scheduleId' | 'order'>) => void;
}

const QUICK_DURATIONS = [
  { label: '30분', value: 30 },
  { label: '1시간', value: 60 },
  { label: '1시간 30분', value: 90 },
  { label: '2시간', value: 120 },
];

const QUICK_TAGS = [
  '롱샷', '바스트샷', '클로즈업', 'FIX', '트라이', '핸드헬드', '달리', 'POV',
  '38mm', '45mm', '26mm', 'RF 10-20', 'Proteus',
];

export function SceneModal({ isOpen, onClose, scene, onSubmit }: SceneModalProps) {
  const [formData, setFormData] = useState({
    sceneNumber: '',
    timeOfDay: 'D' as TimeOfDay,
    locationType: 'E' as LocationType,
    location: '',
    description: '',
    mainCharacters: [] as string[],
    remarks: '',
    estimatedDuration: 60,
    status: 'PENDING' as SceneStatus,
    startTime: '',
    endTime: '',
    cuts: [] as Cut[],
  });
  
  const [durationInput, setDurationInput] = useState('1시간');
  const [characterInput, setCharacterInput] = useState('');
  const [cutInput, setCutInput] = useState('');
  
  // 수정 모드일 때 데이터 로드
  useEffect(() => {
    if (scene) {
      setFormData({
        sceneNumber: scene.sceneNumber,
        timeOfDay: scene.timeOfDay,
        locationType: scene.locationType,
        location: scene.location,
        description: scene.description,
        mainCharacters: scene.mainCharacters,
        remarks: scene.remarks || '',
        estimatedDuration: scene.estimatedDuration,
        status: scene.status,
        startTime: scene.startTime,
        endTime: scene.endTime,
        cuts: scene.cuts || [],
      });
      setDurationInput(formatDuration(scene.estimatedDuration));
    } else {
      // 새로 만들기
      setFormData({
        sceneNumber: '',
        timeOfDay: 'D',
        locationType: 'E',
        location: '',
        description: '',
        mainCharacters: [],
        remarks: '',
        estimatedDuration: 60,
        status: 'PENDING',
        startTime: '',
        endTime: '',
        cuts: [],
      });
      setDurationInput('1시간');
    }
    setCharacterInput('');
    setCutInput('');
  }, [scene, isOpen]);
  
  const handleDurationChange = (value: string) => {
    setDurationInput(value);
    const minutes = parseDuration(value);
    if (minutes > 0) {
      setFormData({ ...formData, estimatedDuration: minutes });
    }
  };
  
  const handleQuickDuration = (minutes: number) => {
    setFormData({ ...formData, estimatedDuration: minutes });
    setDurationInput(formatDuration(minutes));
  };
  
  const handleAddCharacter = () => {
    if (characterInput.trim() && !formData.mainCharacters.includes(characterInput.trim())) {
      setFormData({
        ...formData,
        mainCharacters: [...formData.mainCharacters, characterInput.trim()],
      });
      setCharacterInput('');
    }
  };
  
  const handleRemoveCharacter = (char: string) => {
    setFormData({
      ...formData,
      mainCharacters: formData.mainCharacters.filter((c) => c !== char),
    });
  };
  
  const handleAddTag = (tag: string) => {
    const currentRemarks = formData.remarks;
    const newRemarks = currentRemarks 
      ? `${currentRemarks} ${tag}` 
      : tag;
    setFormData({ ...formData, remarks: newRemarks });
  };
  
  const handleAddCut = () => {
    if (!cutInput.trim()) return;
    const newCut: Cut = {
      id: crypto.randomUUID(),
      cutNumber: cutInput.trim(),
      description: '',
      estimatedDuration: 0,
    };
    setFormData({
      ...formData,
      cuts: [...formData.cuts, newCut],
    });
    setCutInput('');
  };
  
  const handleRemoveCut = (cutId: string) => {
    setFormData({
      ...formData,
      cuts: formData.cuts.filter((c) => c.id !== cutId),
    });
  };
  
  const handleSubmit = () => {
    // 필수 항목 체크: sceneNumber, location, cuts(최소 1개)
    if (!formData.sceneNumber || !formData.location || formData.cuts.length === 0) return;
    
    onSubmit({
      sceneNumber: formData.sceneNumber,
      timeOfDay: formData.timeOfDay,
      locationType: formData.locationType,
      location: formData.location,
      description: formData.description,
      mainCharacters: formData.mainCharacters,
      remarks: formData.remarks || undefined,
      estimatedDuration: formData.estimatedDuration,
      status: formData.status,
      startTime: formData.startTime,
      endTime: formData.endTime,
      cuts: formData.cuts,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {scene ? `씬 수정 - S#${scene.sceneNumber}` : '새 씬 추가'}
          </DialogTitle>
          <DialogDescription>
            촬영할 씬의 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">기본 정보</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sceneNumber">씬 번호 *</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm">
                    S#
                  </span>
                  <Input
                    id="sceneNumber"
                    value={formData.sceneNumber}
                    onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
                    className="rounded-l-none"
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>예상 소요시간</Label>
                <Input
                  value={durationInput}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  placeholder="1h30m, 90분, 1:30"
                />
              </div>
            </div>
            
            {/* 빠른 시간 선택 */}
            <div className="flex flex-wrap gap-2">
              {QUICK_DURATIONS.map((d) => (
                <Button
                  key={d.value}
                  type="button"
                  variant={formData.estimatedDuration === d.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickDuration(d.value)}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* 시간대 & 장소 타입 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시간대 *</Label>
              <Select
                value={formData.timeOfDay}
                onValueChange={(value) => setFormData({ ...formData, timeOfDay: value as TimeOfDay })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_OF_DAY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {key} ({label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>장소 타입 *</Label>
              <Select
                value={formData.locationType}
                onValueChange={(value) => setFormData({ ...formData, locationType: value as LocationType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOCATION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {key} ({label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 촬영장소 */}
          <div className="space-y-2">
            <Label htmlFor="location">촬영장소 *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="예: 국동아파트 놀이터"
            />
          </div>
          
          {/* 촬영내용 */}
          <div className="space-y-2">
            <Label htmlFor="description">촬영내용</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="씬에 대한 설명을 입력하세요 (여러 줄 가능)"
              rows={4}
            />
          </div>
          
          {/* 주요인물 */}
          <div className="space-y-2">
            <Label>주요인물</Label>
            <div className="flex gap-2">
              <Input
                value={characterInput}
                onChange={(e) => setCharacterInput(e.target.value)}
                placeholder="인물 이름"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCharacter())}
              />
              <Button type="button" variant="outline" onClick={handleAddCharacter}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.mainCharacters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.mainCharacters.map((char) => (
                  <Badge key={char} variant="secondary" className="gap-1">
                    {char}
                    <button
                      type="button"
                      onClick={() => handleRemoveCharacter(char)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* CUT 번호 (필수) */}
          <div className="space-y-2">
            <Label>CUT 번호 *</Label>
            <div className="flex gap-2">
              <Input
                value={cutInput}
                onChange={(e) => setCutInput(e.target.value)}
                placeholder="예: 1, 2, 3..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCut())}
              />
              <Button type="button" variant="outline" onClick={handleAddCut}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.cuts.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.cuts.map((cut) => (
                  <Badge key={cut.id} variant="secondary" className="gap-1 px-3 py-1">
                    C{cut.cutNumber}
                    <button
                      type="button"
                      onClick={() => handleRemoveCut(cut.id)}
                      className="hover:text-destructive ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-destructive">최소 1개 이상의 CUT을 추가해주세요</p>
            )}
          </div>
          
          {/* 비고 */}
          <div className="space-y-2">
            <Label htmlFor="remarks">비고 (장비, 렌즈 등)</Label>
            <Input
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="예: 롱샷 38mm FIX 트라이"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_TAGS.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.sceneNumber || !formData.location || formData.cuts.length === 0}
          >
            {scene ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

