import { create } from 'zustand';
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
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      set({ projects: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      set({ currentProject: data, isLoading: false });
      
      // 스태프와 캐스트도 함께 로드
      await Promise.all([
        get().fetchStaff(id),
        get().fetchCasts(id),
      ]);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createProject: async (data: ProjectFormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const record = await res.json();
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
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update project');
      const record = await res.json();
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
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
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
      const res = await fetch(`/api/projects/${projectId}/staff`);
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      set({ staff: data });
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  },
  
  createStaff: async (data) => {
    const res = await fetch(`/api/projects/${data.projectId}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create staff');
    const record = await res.json();
    set((state) => ({ staff: [...state.staff, record] }));
    return record;
  },
  
  updateStaff: async (id: string, data) => {
    const res = await fetch(`/api/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update staff');
    const record = await res.json();
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? record : s)),
    }));
  },
  
  deleteStaff: async (id: string) => {
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete staff');
    set((state) => ({
      staff: state.staff.filter((s) => s.id !== id),
    }));
  },
  
  // Cast methods
  fetchCasts: async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/casts`);
      if (!res.ok) throw new Error('Failed to fetch casts');
      const data = await res.json();
      set({ casts: data });
    } catch (error) {
      console.error('Failed to fetch casts:', error);
    }
  },
  
  createCast: async (data) => {
    const res = await fetch(`/api/projects/${data.projectId}/casts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create cast');
    const record = await res.json();
    set((state) => ({ casts: [...state.casts, record] }));
    return record;
  },
  
  updateCast: async (id: string, data) => {
    const res = await fetch(`/api/casts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update cast');
    const record = await res.json();
    set((state) => ({
      casts: state.casts.map((c) => (c.id === id ? record : c)),
    }));
  },
  
  deleteCast: async (id: string) => {
    const res = await fetch(`/api/casts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete cast');
    set((state) => ({
      casts: state.casts.filter((c) => c.id !== id),
    }));
  },
}));
