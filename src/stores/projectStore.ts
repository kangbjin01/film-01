import { create } from 'zustand';
import pb, { COLLECTIONS } from '@/lib/pocketbase';
import type { Project, ProjectFormData, Staff, Cast } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  staff: Staff[];
  casts: Cast[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, data: Partial<ProjectFormData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Staff
  fetchStaff: (projectId: string) => Promise<void>;
  createStaff: (data: Omit<Staff, 'id' | 'created' | 'updated'>) => Promise<Staff>;
  updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  
  // Cast
  fetchCasts: (projectId: string) => Promise<void>;
  createCast: (data: Omit<Cast, 'id' | 'created' | 'updated'>) => Promise<Cast>;
  updateCast: (id: string, data: Partial<Cast>) => Promise<void>;
  deleteCast: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  staff: [],
  casts: [],
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const records = await pb.collection(COLLECTIONS.PROJECTS).getFullList<Project>({
        sort: '-created',
      });
      set({ projects: records, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const record = await pb.collection(COLLECTIONS.PROJECTS).getOne<Project>(id);
      set({ currentProject: record, isLoading: false });
      
      // 스태프와 캐스트도 함께 로드 (컬렉션이 없어도 에러 무시)
      try {
        await get().fetchStaff(id);
      } catch (e) {
        console.log('Staff collection not available');
      }
      try {
        await get().fetchCasts(id);
      } catch (e) {
        console.log('Casts collection not available');
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createProject: async (data: ProjectFormData) => {
    set({ isLoading: true, error: null });
    try {
      const record = await pb.collection(COLLECTIONS.PROJECTS).create<Project>(data);
      set((state) => ({
        projects: [record, ...state.projects],
        isLoading: false,
      }));
      return record;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateProject: async (id: string, data: Partial<ProjectFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const record = await pb.collection(COLLECTIONS.PROJECTS).update<Project>(id, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? record : p)),
        currentProject: state.currentProject?.id === id ? record : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await pb.collection(COLLECTIONS.PROJECTS).delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
  
  // Staff methods
  fetchStaff: async (projectId: string) => {
    try {
      const records = await pb.collection(COLLECTIONS.STAFF).getFullList<Staff>({
        filter: `projectId = "${projectId}"`,
        sort: 'department,position',
      });
      set({ staff: records });
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  },
  
  createStaff: async (data) => {
    const record = await pb.collection(COLLECTIONS.STAFF).create<Staff>(data);
    set((state) => ({ staff: [...state.staff, record] }));
    return record;
  },
  
  updateStaff: async (id: string, data) => {
    const record = await pb.collection(COLLECTIONS.STAFF).update<Staff>(id, data);
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? record : s)),
    }));
  },
  
  deleteStaff: async (id: string) => {
    await pb.collection(COLLECTIONS.STAFF).delete(id);
    set((state) => ({
      staff: state.staff.filter((s) => s.id !== id),
    }));
  },
  
  // Cast methods
  fetchCasts: async (projectId: string) => {
    try {
      const records = await pb.collection(COLLECTIONS.CASTS).getFullList<Cast>({
        filter: `projectId = "${projectId}"`,
        sort: 'role',
      });
      set({ casts: records });
    } catch (error) {
      console.error('Failed to fetch casts:', error);
    }
  },
  
  createCast: async (data) => {
    const record = await pb.collection(COLLECTIONS.CASTS).create<Cast>(data);
    set((state) => ({ casts: [...state.casts, record] }));
    return record;
  },
  
  updateCast: async (id: string, data) => {
    const record = await pb.collection(COLLECTIONS.CASTS).update<Cast>(id, data);
    set((state) => ({
      casts: state.casts.map((c) => (c.id === id ? record : c)),
    }));
  },
  
  deleteCast: async (id: string) => {
    await pb.collection(COLLECTIONS.CASTS).delete(id);
    set((state) => ({
      casts: state.casts.filter((c) => c.id !== id),
    }));
  },
}));

