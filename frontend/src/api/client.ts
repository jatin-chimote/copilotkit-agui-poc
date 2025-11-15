import axios from 'axios';
import type { Project, ProjectCreate, SubProject, SubProjectCreate, MappingRequest, MappingResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects
export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects/'),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: ProjectCreate) => api.post<Project>('/projects/', data),
  update: (id: number, data: Partial<ProjectCreate>) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// SubProjects
export const subProjectsApi = {
  getByProject: (projectId: number) => api.get<SubProject[]>(`/projects/${projectId}/subprojects`),
  getById: (id: number) => api.get<SubProject>(`/projects/subprojects/${id}`),
  create: (projectId: number, data: SubProjectCreate) =>
    api.post<SubProject>(`/projects/${projectId}/subprojects`, data),
  update: (id: number, data: Partial<SubProjectCreate>) =>
    api.put<SubProject>(`/projects/subprojects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/subprojects/${id}`),
};

// Agent
export const agentApi = {
  mapColumns: (data: MappingRequest) => api.post<MappingResponse>('/agent/map', data),
  refineMapping: (data: MappingRequest) => api.post<MappingResponse>('/agent/refine-mapping', data),
};
