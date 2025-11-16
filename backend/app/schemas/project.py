from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    destination_schema: Dict[str, Any]

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    destination_schema: Optional[Dict[str, Any]] = None

class SubProjectBase(BaseModel):
    name: str
    vendor_name: str
    source_schema: Dict[str, Any]

class SubProjectCreate(SubProjectBase):
    pass

class SubProjectUpdate(BaseModel):
    name: Optional[str] = None
    vendor_name: Optional[str] = None
    source_schema: Optional[Dict[str, Any]] = None
    mapping: Optional[Dict[str, str]] = None

class SubProject(SubProjectBase):
    id: int
    project_id: int
    mapping: Optional[Dict[str, str]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    subprojects: List[SubProject] = []

    class Config:
        from_attributes = True

class MappingRequest(BaseModel):
    subproject_id: int
    user_message: str

class MappingResponse(BaseModel):
    response: str
    suggested_mapping: Optional[Dict[str, str]] = None
    confidence: Optional[float] = None
