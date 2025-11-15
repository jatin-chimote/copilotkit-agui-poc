# Data Mapper Agent - Backend

FastAPI backend with LangGraph agent for intelligent schema mapping.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Run the server:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Endpoints

### Projects
- `POST /projects/` - Create a new project with destination schema
- `GET /projects/` - List all projects
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### SubProjects (Vendor Schemas)
- `POST /projects/{id}/subprojects` - Add vendor schema to project
- `GET /projects/{id}/subprojects` - List vendor schemas
- `GET /projects/subprojects/{id}` - Get subproject details
- `PUT /projects/subprojects/{id}` - Update subproject
- `DELETE /projects/subprojects/{id}` - Delete subproject

### AI Agent
- `POST /agent/map` - Map columns using AI agent
- `POST /agent/refine-mapping` - Refine existing mapping with feedback
