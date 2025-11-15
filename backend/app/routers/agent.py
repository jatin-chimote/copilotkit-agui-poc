from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import SubProject
from app.schemas.project import MappingRequest, MappingResponse
from app.agents.data_mapper_agent import DataMapperAgent
import os

router = APIRouter(prefix="/agent", tags=["agent"])

# Initialize the agent (will be lazy-loaded)
_agent = None

def get_agent():
    global _agent
    if _agent is None:
        _agent = DataMapperAgent()
    return _agent

@router.post("/map", response_model=MappingResponse)
async def map_columns(request: MappingRequest, db: Session = Depends(get_db)):
    """
    Use the AI agent to map columns from source to destination schema.
    """
    # Get the subproject
    subproject = db.query(SubProject).filter(SubProject.id == request.subproject_id).first()
    if not subproject:
        raise HTTPException(status_code=404, detail="SubProject not found")

    # Get the destination schema from the parent project
    project = subproject.project
    if not project:
        raise HTTPException(status_code=404, detail="Parent project not found")

    try:
        agent = get_agent()

        # Use existing mapping if available as a starting point
        current_mapping = subproject.mapping if subproject.mapping else None

        # Call the agent
        result = agent.map_schemas(
            source_schema=subproject.source_schema,
            destination_schema=project.destination_schema,
            user_message=request.user_message,
            current_mapping=current_mapping
        )

        # Update the subproject with the new mapping
        subproject.mapping = result["mapping"]
        db.commit()
        db.refresh(subproject)

        return MappingResponse(
            response=result["response"],
            suggested_mapping=result["mapping"],
            confidence=result["confidence"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

@router.post("/refine-mapping", response_model=MappingResponse)
async def refine_mapping(request: MappingRequest, db: Session = Depends(get_db)):
    """
    Refine an existing mapping based on user feedback.
    """
    subproject = db.query(SubProject).filter(SubProject.id == request.subproject_id).first()
    if not subproject:
        raise HTTPException(status_code=404, detail="SubProject not found")

    if not subproject.mapping:
        raise HTTPException(status_code=400, detail="No existing mapping to refine")

    project = subproject.project

    try:
        agent = get_agent()

        result = agent.refine_mapping(
            source_schema=subproject.source_schema,
            destination_schema=project.destination_schema,
            current_mapping=subproject.mapping,
            user_feedback=request.user_message
        )

        # Update the mapping
        subproject.mapping = result["mapping"]
        db.commit()
        db.refresh(subproject)

        return MappingResponse(
            response=result["response"],
            suggested_mapping=result["mapping"],
            confidence=result["confidence"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
