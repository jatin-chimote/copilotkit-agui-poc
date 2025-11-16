from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import projects, agent
from copilotkit import CopilotKitSDK
from app.copilotkit_integration import get_copilot_actions

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Data Mapper Agent API",
    description="AI-powered column mapping for data integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CopilotKit
copilot_sdk = CopilotKitSDK(
    actions=get_copilot_actions()
)

# Include routers
app.include_router(projects.router)
app.include_router(agent.router)
app.include_router(copilot_sdk.router, prefix="/copilotkit")

@app.get("/")
def read_root():
    return {
        "message": "Data Mapper Agent API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
