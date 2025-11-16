from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.project import Project, SubProject
from app.schemas.project import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
    SubProject as SubProjectSchema,
    SubProjectCreate,
    SubProjectUpdate
)
from app.utils.file_parser import SchemaExtractor

router = APIRouter(prefix="/projects", tags=["projects"])

# Project CRUD
@router.post("/", response_model=ProjectSchema)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.name == project.name).first()
    if db_project:
        raise HTTPException(status_code=400, detail="Project already exists")

    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectSchema])
def list_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.post("/upload-schema")
async def upload_destination_schema(file: UploadFile = File(...)):
    """
    Upload a file (CSV, Excel, JSON) and extract destination schema.
    Returns the parsed schema for review before creating a project.
    """
    schema = await SchemaExtractor.extract_schema_from_file(file)
    return {
        "filename": file.filename,
        "schema": schema,
        "message": "Schema extracted successfully. Review and create project."
    }

# SubProject CRUD
@router.post("/{project_id}/subprojects", response_model=SubProjectSchema)
def create_subproject(project_id: int, subproject: SubProjectCreate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    subproject_data = subproject.dict()
    subproject_data['project_id'] = project_id
    db_subproject = SubProject(**subproject_data)
    db.add(db_subproject)
    db.commit()
    db.refresh(db_subproject)
    return db_subproject

@router.get("/{project_id}/subprojects", response_model=List[SubProjectSchema])
def list_subprojects(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    return db_project.subprojects

@router.get("/subprojects/{subproject_id}", response_model=SubProjectSchema)
def get_subproject(subproject_id: int, db: Session = Depends(get_db)):
    subproject = db.query(SubProject).filter(SubProject.id == subproject_id).first()
    if not subproject:
        raise HTTPException(status_code=404, detail="SubProject not found")
    return subproject

@router.put("/subprojects/{subproject_id}", response_model=SubProjectSchema)
def update_subproject(subproject_id: int, subproject: SubProjectUpdate, db: Session = Depends(get_db)):
    db_subproject = db.query(SubProject).filter(SubProject.id == subproject_id).first()
    if not db_subproject:
        raise HTTPException(status_code=404, detail="SubProject not found")

    update_data = subproject.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subproject, key, value)

    db.commit()
    db.refresh(db_subproject)
    return db_subproject

@router.delete("/subprojects/{subproject_id}")
def delete_subproject(subproject_id: int, db: Session = Depends(get_db)):
    db_subproject = db.query(SubProject).filter(SubProject.id == subproject_id).first()
    if not db_subproject:
        raise HTTPException(status_code=404, detail="SubProject not found")

    db.delete(db_subproject)
    db.commit()
    return {"message": "SubProject deleted successfully"}

@router.post("/{project_id}/subprojects/upload-schema")
async def upload_source_schema(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a file (CSV, Excel, JSON) and extract source schema for a subproject.
    Returns the parsed schema for review before creating a subproject.
    """
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    schema = await SchemaExtractor.extract_schema_from_file(file)
    return {
        "filename": file.filename,
        "schema": schema,
        "project_id": project_id,
        "message": "Schema extracted successfully. Review and create subproject."
    }
