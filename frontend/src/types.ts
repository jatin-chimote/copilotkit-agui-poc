export interface Project {
  id: number;
  name: string;
  description?: string;
  destination_schema: Record<string, any>;
  created_at: string;
  updated_at: string;
  subprojects: SubProject[];
}

export interface SubProject {
  id: number;
  project_id: number;
  name: string;
  vendor_name: string;
  source_schema: Record<string, any>;
  mapping?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  destination_schema: Record<string, any>;
}

export interface SubProjectCreate {
  name: string;
  vendor_name: string;
  source_schema: Record<string, any>;
}

export interface MappingRequest {
  subproject_id: number;
  user_message: string;
}

export interface MappingResponse {
  response: string;
  suggested_mapping?: Record<string, string>;
  confidence?: number;
}
