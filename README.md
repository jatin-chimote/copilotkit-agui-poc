# Data Mapper Agent

A full-stack AI-powered application for intelligent schema mapping using CopilotKit and LangGraph.

## 🚀 Run Without Local Installation!

**No need to install Python, Node.js, or anything on your machine!**

Choose any cloud option:

| Platform | Setup Time | Cost | Best For |
|----------|------------|------|----------|
| [**GitHub Codespaces**](#github-codespaces) | 3 min | Free (60h/mo) | ⭐ Recommended - Development |
| [**Gitpod**](#gitpod) | 2 min | Free (50h/mo) | Quick Testing |
| [**Railway**](#railway) | 5 min | Free tier | Production Deploy |
| [**Render**](#render) | 10 min | 100% Free | Free Hosting |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed cloud deployment instructions.

### Quick Start (Cloud)

#### GitHub Codespaces
1. Click the **Code** button on GitHub
2. Select **Codespaces** → **Create codespace**
3. Wait 2-3 minutes for auto-setup
4. Open port 3000 in browser
5. Done! ✅

#### Gitpod
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/YOUR_USERNAME/copilotkit-agui-poc)

Click the button above and start coding in the cloud!

---

## Overview

This application helps organizations consolidate data from multiple vendors by intelligently mapping varying source schemas to a standardized destination schema. It uses LangGraph agents to provide AI-powered column mapping suggestions through an interactive chat interface.

## Architecture

### Backend
- **FastAPI**: REST API server
- **LangGraph**: AI agent orchestration for intelligent mapping
- **LangChain + OpenAI**: LLM-powered schema analysis
- **SQLAlchemy**: ORM for data persistence
- **SQLite**: Database (easily swappable with PostgreSQL)

### Frontend
- **React**: Modern SPA with TypeScript
- **CopilotKit**: AI chat interface integration
- **TanStack Query**: Data fetching and caching
- **Zustand**: State management
- **Vite**: Build tool and dev server

## Features

### Projects
- Create projects with destination schemas
- Define the standard schema all vendors will map to
- Manage multiple projects for different data types

### Vendor Schemas (SubProjects)
- Add multiple vendor schemas per project
- Upload vendor-specific source schemas
- Track mapping status for each vendor

### AI-Powered Mapping
- LangGraph agent analyzes schemas intelligently
- Semantic matching beyond simple column name comparison
- Confidence scoring for each mapping
- Interactive refinement through chat
- Suggestions for transformations when needed

### Visualization
- Side-by-side schema comparison
- Visual mapping indicators
- Confidence badges
- Real-time updates

## Getting Started

### Cloud Deployment (No Installation Needed!)

**Recommended:** Use [GitHub Codespaces](./DEPLOYMENT.md#option-1-github-codespaces-recommended---100-cloud) or [Gitpod](./DEPLOYMENT.md#option-2-gitpod-one-click-cloud-ide) to run without any local setup.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for all cloud options.

---

### Local Installation (Optional)

Only follow these steps if you want to run locally instead of using cloud options above.

#### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API key

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

5. Run the server:
```bash
python -m uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the dev server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Usage Guide

### 1. Create a Project
- Click "New" in the Projects sidebar
- Enter project name (e.g., "Purchase Orders")
- Define your destination schema in JSON format
- This becomes your standard schema

### 2. Add Vendor Schemas
- Select a project
- Click "Add Vendor"
- Enter vendor name and their schema
- The vendor's source schema should match their data format

### 3. Map Columns with AI
- Select a vendor schema
- View side-by-side comparison
- Chat with the AI agent:
  - "Map all columns intelligently"
  - "Map vendor_date to purchase_date"
  - "Which columns don't have matches?"
- Review suggested mappings
- Refine with additional feedback

### 4. View Results
- Confidence scores show mapping quality
- Green highlights indicate mapped columns
- Export or use mappings for data transformation

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Example Schemas

### Destination Schema (Purchase Orders)
```json
{
  "purchase_order_id": "string",
  "vendor_name": "string",
  "order_date": "date",
  "total_amount": "number",
  "currency": "string",
  "status": "string",
  "line_items": "array"
}
```

### Vendor A Source Schema
```json
{
  "po_number": "string",
  "supplier": "string",
  "created_at": "datetime",
  "total": "decimal",
  "curr": "string",
  "state": "string",
  "items": "list"
}
```

The AI agent will intelligently map:
- `po_number` → `purchase_order_id`
- `supplier` → `vendor_name`
- `created_at` → `order_date`
- `total` → `total_amount`
- `curr` → `currency`
- `state` → `status`
- `items` → `line_items`

## Tech Stack Details

### LangGraph Agent
The data mapper agent uses a multi-node workflow:
1. **Analyze Schemas**: Understand structure and semantics
2. **Generate Mapping**: Create intelligent mappings
3. **Validate Mapping**: Check completeness and quality

### CopilotKit Integration
CopilotKit provides:
- Natural language interface
- Context-aware suggestions
- Conversational refinement
- User-friendly chat UI

## Development

### Project Structure
```
copilotkit-agui-poc/
├── backend/
│   ├── app/
│   │   ├── agents/          # LangGraph agents
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routers/         # FastAPI routes
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # API client
│   │   ├── store/           # Zustand store
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Future Enhancements

- [ ] PostgreSQL support
- [ ] User authentication
- [ ] Batch processing
- [ ] Export mappings to various formats
- [ ] Data preview and validation
- [ ] Transformation rules engine
- [ ] Mapping templates
- [ ] Collaborative features
- [ ] Version control for schemas

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
