import { create } from 'zustand';
import type { Project, SubProject } from '../types';

interface AppState {
  selectedProject: Project | null;
  selectedSubProject: SubProject | null;
  setSelectedProject: (project: Project | null) => void;
  setSelectedSubProject: (subProject: SubProject | null) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedProject: null,
  selectedSubProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedSubProject: (subProject) => set({ selectedSubProject: subProject }),
}));
