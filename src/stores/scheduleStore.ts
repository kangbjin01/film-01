import { create } from 'zustand';
import type {
  DailySchedule,
  DailyScheduleFormData,
  Scene,
  SceneFormData,
  TimelineItem,
  TimelineItemFormData,
  DepartmentDetail,
  CastSchedule,
  Cast,
} from '@/types';
import { calculateTimeFromDuration } from '@/lib/timeUtils';

interface ScheduleState {
  schedules: DailySchedule[];
  currentSchedule: DailySchedule | null;
  scenes: Scene[];
  timeline: TimelineItem[];
  departmentDetails: DepartmentDetail[];
  castSchedules: (CastSchedule & { cast?: Cast })[];
  isLoading: boolean;
  error: string | null;
  
  // Schedule Actions
  fetchSchedules: (projectId: string) => Promise<void>;
  fetchSchedule: (id: string) => Promise<void>;
  createSchedule: (data: DailyScheduleFormData) => Promise<DailySchedule>;
  updateSchedule: (id: string, data: Partial<DailyScheduleFormData>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  
  // Scene Actions
  fetchScenes: (scheduleId: string) => Promise<void>;
  createScene: (data: SceneFormData) => Promise<Scene>;
  updateScene: (id: string, data: Partial<SceneFormData>) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  reorderScenes: (scenes: Scene[]) => Promise<void>;
  recalculateSceneTimes: (startTime: string) => void;
  
  // Timeline Actions
  fetchTimeline: (scheduleId: string) => Promise<void>;
  createTimelineItem: (data: TimelineItemFormData) => Promise<TimelineItem>;
  updateTimelineItem: (id: string, data: Partial<TimelineItemFormData>) => Promise<void>;
  deleteTimelineItem: (id: string) => Promise<void>;
  
  // Department Details (현재 미사용)
  fetchDepartmentDetails: (scheduleId: string) => Promise<void>;
  saveDepartmentDetail: (data: Omit<DepartmentDetail, 'id' | 'created' | 'updated'>) => Promise<void>;
  
  // Cast Schedules (현재 미사용)
  fetchCastSchedules: (scheduleId: string) => Promise<void>;
  saveCastSchedule: (data: Omit<CastSchedule, 'id' | 'created' | 'updated'>) => Promise<void>;
  deleteCastSchedule: (id: string) => Promise<void>;
  
  // Local state updates
  setScenes: (scenes: Scene[]) => void;
  clearCurrentSchedule: () => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  currentSchedule: null,
  scenes: [],
  timeline: [],
  departmentDetails: [],
  castSchedules: [],
  isLoading: false,
  error: null,
  
  // Schedule methods
  fetchSchedules: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${projectId}/schedules`);
      if (!res.ok) throw new Error('Failed to fetch schedules');
      const data = await res.json();
      set({ schedules: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchSchedule: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/schedules/${id}`);
      if (!res.ok) throw new Error('Failed to fetch schedule');
      const data = await res.json();
      
      // 응답에 scenes와 timeline이 포함되어 있음
      const scenesWithCuts = (data.scenes || []).map((scene: Scene) => ({
        ...scene,
        cuts: scene.cuts || [],
      }));
      
      set({
        currentSchedule: data,
        scenes: scenesWithCuts,
        timeline: data.timeline || [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createSchedule: async (data: DailyScheduleFormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${data.projectId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create schedule');
      const record = await res.json();
      set((state) => ({
        schedules: [record, ...state.schedules],
        isLoading: false,
      }));
      return record;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateSchedule: async (id: string, data: Partial<DailyScheduleFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update schedule');
      const record = await res.json();
      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === id ? record : s)),
        currentSchedule: state.currentSchedule?.id === id ? record : state.currentSchedule,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteSchedule: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        currentSchedule: state.currentSchedule?.id === id ? null : state.currentSchedule,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  // Scene methods
  fetchScenes: async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/scenes`);
      if (!res.ok) throw new Error('Failed to fetch scenes');
      const data = await res.json();
      const scenesWithCuts = data.map((scene: Scene) => ({
        ...scene,
        cuts: scene.cuts || [],
      }));
      set({ scenes: scenesWithCuts });
    } catch (error) {
      console.error('Failed to fetch scenes:', error);
    }
  },
  
  createScene: async (data: SceneFormData) => {
    const dataWithCuts = { ...data, cuts: data.cuts || [] };
    const res = await fetch(`/api/schedules/${data.scheduleId}/scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataWithCuts),
    });
    if (!res.ok) throw new Error('Failed to create scene');
    const record = await res.json();
    const recordWithCuts = { ...record, cuts: record.cuts || [] };
    set((state) => ({
      scenes: [...state.scenes, recordWithCuts].sort((a, b) => a.order - b.order),
    }));
    return recordWithCuts;
  },
  
  updateScene: async (id: string, data: Partial<SceneFormData>) => {
    const res = await fetch(`/api/scenes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update scene');
    const record = await res.json();
    const recordWithCuts = { ...record, cuts: record.cuts || [] };
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? recordWithCuts : s)),
    }));
  },
  
  deleteScene: async (id: string) => {
    const res = await fetch(`/api/scenes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete scene');
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== id),
    }));
  },
  
  reorderScenes: async (scenes: Scene[]) => {
    // 로컬 상태 먼저 업데이트
    set({ scenes });
    
    // 서버에 순서 업데이트
    try {
      const res = await fetch('/api/scenes/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes.map((scene, index) => ({ id: scene.id, order: index })),
        }),
      });
      if (!res.ok) throw new Error('Failed to reorder scenes');
    } catch (error) {
      console.error('Failed to reorder scenes:', error);
    }
  },
  
  recalculateSceneTimes: (startTime: string) => {
    const { scenes } = get();
    let currentTime = startTime;
    
    const updatedScenes = scenes.map((scene) => {
      const newStartTime = currentTime;
      const newEndTime = calculateTimeFromDuration(currentTime, scene.estimatedDuration);
      currentTime = newEndTime;
      
      return {
        ...scene,
        startTime: newStartTime,
        endTime: newEndTime,
      };
    });
    
    set({ scenes: updatedScenes });
  },
  
  // Timeline methods
  fetchTimeline: async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/timeline`);
      if (!res.ok) throw new Error('Failed to fetch timeline');
      const data = await res.json();
      set({ timeline: data });
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  },
  
  createTimelineItem: async (data: TimelineItemFormData) => {
    const res = await fetch(`/api/schedules/${data.scheduleId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create timeline item');
    const record = await res.json();
    set((state) => ({
      timeline: [...state.timeline, record].sort((a, b) => a.order - b.order),
    }));
    return record;
  },
  
  updateTimelineItem: async (id: string, data: Partial<TimelineItemFormData>) => {
    const res = await fetch(`/api/timeline/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update timeline item');
    const record = await res.json();
    set((state) => ({
      timeline: state.timeline.map((t) => (t.id === id ? record : t)),
    }));
  },
  
  deleteTimelineItem: async (id: string) => {
    const res = await fetch(`/api/timeline/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete timeline item');
    set((state) => ({
      timeline: state.timeline.filter((t) => t.id !== id),
    }));
  },
  
  // Department Details (현재 미사용 - 나중에 필요시 API 추가)
  fetchDepartmentDetails: async () => {
    set({ departmentDetails: [] });
  },
  
  saveDepartmentDetail: async () => {
    // 미구현
  },
  
  // Cast Schedules (현재 미사용 - 나중에 필요시 API 추가)
  fetchCastSchedules: async () => {
    set({ castSchedules: [] });
  },
  
  saveCastSchedule: async () => {
    // 미구현
  },
  
  deleteCastSchedule: async () => {
    // 미구현
  },
  
  // Local state
  setScenes: (scenes: Scene[]) => {
    set({ scenes });
  },
  
  clearCurrentSchedule: () => {
    set({
      currentSchedule: null,
      scenes: [],
      timeline: [],
      departmentDetails: [],
      castSchedules: [],
    });
  },
}));
