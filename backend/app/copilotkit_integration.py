from copilotkit import CopilotKitSDK, Action
from copilotkit.langchain import copilotkit_emit_state, copilotkit_customize_config
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project, SubProject
from app.agents.data_mapper_agent import DataMapperAgent
from app.utils.file_parser import SchemaExtractor
import json


def get_copilot_actions():
    """Define CopilotKit actions for the data mapper application"""

    actions = [
        Action(
            name="create_project",
            description="Create a new project with a destination schema. The schema should be a JSON object with column definitions.",
            parameters=[
                {
                    "name": "project_name",
                    "type": "string",
                    "description": "Name of the project (e.g., 'Purchase Orders')",
                    "required": True
                },
                {
                    "name": "description",
                    "type": "string",
                    "description": "Optional description of the project",
                    "required": False
                },
                {
                    "name": "destination_schema",
                    "type": "object",
                    "description": "The destination schema as a JSON object with columns array",
                    "required": True
                }
            ],
            handler=create_project_handler
        ),

        Action(
            name="create_subproject",
            description="Create a vendor subproject (source schema) under an existing project",
            parameters=[
                {
                    "name": "project_id",
                    "type": "number",
                    "description": "ID of the parent project",
                    "required": True
                },
                {
                    "name": "name",
                    "type": "string",
                    "description": "Name of the vendor schema",
                    "required": True
                },
                {
                    "name": "vendor_name",
                    "type": "string",
                    "description": "Name of the vendor",
                    "required": True
                },
                {
                    "name": "source_schema",
                    "type": "object",
                    "description": "The vendor's source schema as a JSON object",
                    "required": True
                }
            ],
            handler=create_subproject_handler
        ),

        Action(
            name="list_projects",
            description="List all projects with their vendors",
            parameters=[],
            handler=list_projects_handler
        ),

        Action(
            name="get_project_details",
            description="Get detailed information about a specific project including its destination schema and vendors",
            parameters=[
                {
                    "name": "project_id",
                    "type": "number",
                    "description": "ID of the project",
                    "required": True
                }
            ],
            handler=get_project_details_handler
        ),

        Action(
            name="map_columns",
            description="Map columns from a vendor's source schema to the destination schema using AI",
            parameters=[
                {
                    "name": "subproject_id",
                    "type": "number",
                    "description": "ID of the vendor subproject to map",
                    "required": True
                },
                {
                    "name": "instructions",
                    "type": "string",
                    "description": "Additional instructions for the mapping (e.g., 'map all columns' or 'map only the customer fields')",
                    "required": False
                }
            ],
            handler=map_columns_handler
        ),

        Action(
            name="delete_project",
            description="Delete a project and all its vendor schemas",
            parameters=[
                {
                    "name": "project_id",
                    "type": "number",
                    "description": "ID of the project to delete",
                    "required": True
                }
            ],
            handler=delete_project_handler
        ),

        Action(
            name="delete_vendor",
            description="Delete a vendor subproject",
            parameters=[
                {
                    "name": "subproject_id",
                    "type": "number",
                    "description": "ID of the vendor subproject to delete",
                    "required": True
                }
            ],
            handler=delete_vendor_handler
        )
    ]

    return actions


# Action Handlers

def create_project_handler(project_name: str, destination_schema: Dict[str, Any], description: str = None, **kwargs):
    """Handler for creating a new project"""
    # Get database session from kwargs (injected by CopilotKit)
    db: Session = next(get_db())

    try:
        # Check if project exists
        existing = db.query(Project).filter(Project.name == project_name).first()
        if existing:
            return {
                "success": False,
                "message": f"Project '{project_name}' already exists. Please choose a different name."
            }

        # Create project
        project = Project(
            name=project_name,
            description=description,
            destination_schema=destination_schema
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        return {
            "success": True,
            "message": f"Project '{project_name}' created successfully!",
            "project_id": project.id,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "column_count": len(destination_schema.get('columns', []))
            }
        }
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Error creating project: {str(e)}"
        }
    finally:
        db.close()


def create_subproject_handler(project_id: int, name: str, vendor_name: str, source_schema: Dict[str, Any], **kwargs):
    """Handler for creating a vendor subproject"""
    db: Session = next(get_db())

    try:
        # Check if project exists
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {
                "success": False,
                "message": f"Project with ID {project_id} not found."
            }

        # Create subproject
        subproject = SubProject(
            project_id=project_id,
            name=name,
            vendor_name=vendor_name,
            source_schema=source_schema
        )
        db.add(subproject)
        db.commit()
        db.refresh(subproject)

        return {
            "success": True,
            "message": f"Vendor '{vendor_name}' added to project '{project.name}' successfully!",
            "subproject_id": subproject.id,
            "subproject": {
                "id": subproject.id,
                "name": subproject.name,
                "vendor_name": subproject.vendor_name,
                "column_count": len(source_schema.get('columns', []))
            }
        }
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Error creating vendor: {str(e)}"
        }
    finally:
        db.close()


def list_projects_handler(**kwargs):
    """Handler for listing all projects"""
    db: Session = next(get_db())

    try:
        projects = db.query(Project).all()

        result = []
        for project in projects:
            result.append({
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "vendor_count": len(project.subprojects),
                "vendors": [
                    {
                        "id": sp.id,
                        "name": sp.name,
                        "vendor_name": sp.vendor_name,
                        "has_mapping": sp.mapping is not None
                    }
                    for sp in project.subprojects
                ]
            })

        return {
            "success": True,
            "projects": result,
            "total_count": len(result)
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error listing projects: {str(e)}"
        }
    finally:
        db.close()


def get_project_details_handler(project_id: int, **kwargs):
    """Handler for getting project details"""
    db: Session = next(get_db())

    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {
                "success": False,
                "message": f"Project with ID {project_id} not found."
            }

        return {
            "success": True,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "destination_schema": project.destination_schema,
                "vendors": [
                    {
                        "id": sp.id,
                        "name": sp.name,
                        "vendor_name": sp.vendor_name,
                        "source_schema": sp.source_schema,
                        "mapping": sp.mapping,
                        "has_mapping": sp.mapping is not None
                    }
                    for sp in project.subprojects
                ]
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error getting project details: {str(e)}"
        }
    finally:
        db.close()


def map_columns_handler(subproject_id: int, instructions: str = "Map all columns automatically", **kwargs):
    """Handler for AI-powered column mapping"""
    db: Session = next(get_db())

    try:
        # Get subproject
        subproject = db.query(SubProject).filter(SubProject.id == subproject_id).first()
        if not subproject:
            return {
                "success": False,
                "message": f"Vendor with ID {subproject_id} not found."
            }

        # Get agent
        agent = DataMapperAgent()

        # Perform mapping
        result = agent.map_schemas(
            source_schema=subproject.source_schema,
            destination_schema=subproject.project.destination_schema,
            user_message=instructions,
            current_mapping=subproject.mapping
        )

        # Update mapping
        subproject.mapping = result["mapping"]
        db.commit()
        db.refresh(subproject)

        return {
            "success": True,
            "message": "Mapping completed successfully!",
            "vendor_name": subproject.vendor_name,
            "mapping": result["mapping"],
            "confidence": result.get("confidence", 0.0),
            "ai_response": result.get("response", "Mapping generated successfully")
        }
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Error during mapping: {str(e)}"
        }
    finally:
        db.close()


def delete_project_handler(project_id: int, **kwargs):
    """Handler for deleting a project"""
    db: Session = next(get_db())

    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {
                "success": False,
                "message": f"Project with ID {project_id} not found."
            }

        project_name = project.name
        vendor_count = len(project.subprojects)

        db.delete(project)
        db.commit()

        return {
            "success": True,
            "message": f"Project '{project_name}' and {vendor_count} vendor(s) deleted successfully."
        }
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Error deleting project: {str(e)}"
        }
    finally:
        db.close()


def delete_vendor_handler(subproject_id: int, **kwargs):
    """Handler for deleting a vendor"""
    db: Session = next(get_db())

    try:
        subproject = db.query(SubProject).filter(SubProject.id == subproject_id).first()
        if not subproject:
            return {
                "success": False,
                "message": f"Vendor with ID {subproject_id} not found."
            }

        vendor_name = subproject.vendor_name

        db.delete(subproject)
        db.commit()

        return {
            "success": True,
            "message": f"Vendor '{vendor_name}' deleted successfully."
        }
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Error deleting vendor: {str(e)}"
        }
    finally:
        db.close()
