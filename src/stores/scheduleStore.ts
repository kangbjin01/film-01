import { create } from 'zustand';
import pb, { COLLECTIONS } from '@/lib/pocketbase';
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
import { calculateTimeFromDuration, formatTime } from '@/lib/timeUtils';

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
  
  // Department Details
  fetchDepartmentDetails: (scheduleId: string) => Promise<void>;
  saveDepartmentDetail: (data: Omit<DepartmentDetail, 'id' | 'created' | 'updated'>) => Promise<void>;
  
  // Cast Schedules
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
      const records = await pb.collection(COLLECTIONS.SCHEDULES).getFullList<DailySchedule>({
        filter: `projectId = "${projectId}"`,
        sort: '-shootingDate',
      });
      set({ schedules: records, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchSchedule: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const record = await pb.collection(COLLECTIONS.SCHEDULES).getOne<DailySchedule>(id);
      set({ currentSchedule: record, isLoading: false });
      
      // 관련 데이터 로드 (존재하지 않는 컬렉션은 무시)
      await Promise.all([
        get().fetchScenes(id),
        get().fetchTimeline(id),
        get().fetchDepartmentDetails(id).catch(() => {}),
        get().fetchCastSchedules(id).catch(() => {}),
      ]);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createSchedule: async (data: DailyScheduleFormData) => {
    set({ isLoading: true, error: null });
    try {
      const record = await pb.collection(COLLECTIONS.SCHEDULES).create<DailySchedule>(data);
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
      const record = await pb.collection(COLLECTIONS.SCHEDULES).update<DailySchedule>(id, data);
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
      await pb.collection(COLLECTIONS.SCHEDULES).delete(id);
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
      const records = await pb.collection(COLLECTIONS.SCENES).getFullList<Scene>({
        filter: `scheduleId = "${scheduleId}"`,
        sort: 'order',
      });
      // cuts 필드가 없는 기존 데이터 호환성 처리
      const scenesWithCuts = records.map(scene => ({
        ...scene,
        cuts: scene.cuts || [],
      }));
      set({ scenes: scenesWithCuts });
    } catch (error) {
      console.error('Failed to fetch scenes:', error);
    }
  },
  
  createScene: async (data: SceneFormData) => {
    // cuts가 없으면 빈 배열 추가
    const dataWithCuts = { ...data, cuts: data.cuts || [] };
    const record = await pb.collection(COLLECTIONS.SCENES).create<Scene>(dataWithCuts);
    const recordWithCuts = { ...record, cuts: record.cuts || [] };
    set((state) => ({
      scenes: [...state.scenes, recordWithCuts].sort((a, b) => a.order - b.order),
    }));
    return recordWithCuts;
  },
  
  updateScene: async (id: string, data: Partial<SceneFormData>) => {
    const record = await pb.collection(COLLECTIONS.SCENES).update<Scene>(id, data);
    const recordWithCuts = { ...record, cuts: record.cuts || [] };
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? recordWithCuts : s)),
    }));
  },
  
  deleteScene: async (id: string) => {
    await pb.collection(COLLECTIONS.SCENES).delete(id);
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== id),
    }));
  },
  
  reorderScenes: async (scenes: Scene[]) => {
    // 로컬 상태 먼저 업데이트
    set({ scenes });
    
    // 서버에 순서 업데이트
    try {
      await Promise.all(
        scenes.map((scene, index) =>
          pb.collection(COLLECTIONS.SCENES).update(scene.id, { order: index })
        )
      );
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
      const records = await pb.collection(COLLECTIONS.TIMELINE).getFullList<TimelineItem>({
        filter: `scheduleId = "${scheduleId}"`,
        sort: 'order',
      });
      set({ timeline: records });
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  },
  
  createTimelineItem: async (data: TimelineItemFormData) => {
    const record = await pb.collection(COLLECTIONS.TIMELINE).create<TimelineItem>(data);
    set((state) => ({
      timeline: [...state.timeline, record].sort((a, b) => a.order - b.order),
    }));
    return record;
  },
  
  updateTimelineItem: async (id: string, data: Partial<TimelineItemFormData>) => {
    const record = await pb.collection(COLLECTIONS.TIMELINE).update<TimelineItem>(id, data);
    set((state) => ({
      timeline: state.timeline.map((t) => (t.id === id ? record : t)),
    }));
  },
  
  deleteTimelineItem: async (id: string) => {
    await pb.collection(COLLECTIONS.TIMELINE).delete(id);
    set((state) => ({
      timeline: state.timeline.filter((t) => t.id !== id),
    }));
  },
  
  // Department Details
  fetchDepartmentDetails: async (scheduleId: string) => {
    try {
      const records = await pb.collection(COLLECTIONS.DEPARTMENT_DETAILS).getFullList<DepartmentDetail>({
        filter: `scheduleId = "${scheduleId}"`,
      });
      set({ departmentDetails: records });
    } catch (error) {
      console.error('Failed to fetch department details:', error);
    }
  },
  
  saveDepartmentDetail: async (data) => {
    const { departmentDetails } = get();
    const existing = departmentDetails.find(
      (d) => d.scheduleId === data.scheduleId && d.department === data.department
    );
    
    if (existing) {
      const record = await pb.collection(COLLECTIONS.DEPARTMENT_DETAILS).update<DepartmentDetail>(
        existing.id,
        data
      );
      set((state) => ({
        departmentDetails: state.departmentDetails.map((d) =>
          d.id === existing.id ? record : d
        ),
      }));
    } else {
      const record = await pb.collection(COLLECTIONS.DEPARTMENT_DETAILS).create<DepartmentDetail>(data);
      set((state) => ({
        departmentDetails: [...state.departmentDetails, record],
      }));
    }
  },
  
  // Cast Schedules
  fetchCastSchedules: async (scheduleId: string) => {
    try {
      const records = await pb.collection(COLLECTIONS.CAST_SCHEDULES).getFullList<CastSchedule>({
        filter: `scheduleId = "${scheduleId}"`,
        expand: 'castId',
      });
      
      const withCast = records.map((record) => ({
        ...record,
        cast: (record as any).expand?.castId as Cast | undefined,
      }));
      
      set({ castSchedules: withCast });
    } catch (error) {
      console.error('Failed to fetch cast schedules:', error);
    }
  },
  
  saveCastSchedule: async (data) => {
    const { castSchedules } = get();
    const existing = castSchedules.find(
      (cs) => cs.scheduleId === data.scheduleId && cs.castId === data.castId
    );
    
    if (existing) {
      const record = await pb.collection(COLLECTIONS.CAST_SCHEDULES).update<CastSchedule>(
        existing.id,
        data
      );
      set((state) => ({
        castSchedules: state.castSchedules.map((cs) =>
          cs.id === existing.id ? { ...record, cast: cs.cast } : cs
        ),
      }));
    } else {
      const record = await pb.collection(COLLECTIONS.CAST_SCHEDULES).create<CastSchedule>(data);
      // Cast 정보 가져오기
      const cast = await pb.collection(COLLECTIONS.CASTS).getOne<Cast>(data.castId);
      set((state) => ({
        castSchedules: [...state.castSchedules, { ...record, cast }],
      }));
    }
  },
  
  deleteCastSchedule: async (id: string) => {
    await pb.collection(COLLECTIONS.CAST_SCHEDULES).delete(id);
    set((state) => ({
      castSchedules: state.castSchedules.filter((cs) => cs.id !== id),
    }));
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

