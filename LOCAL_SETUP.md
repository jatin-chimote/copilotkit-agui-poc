# Local Setup Guide

Complete step-by-step guide to run Data Mapper Agent on your local machine.

---

## Step 1: Verify Prerequisites

Open your terminal and check if you have the required tools:

### Check Python (3.10 or higher)
```bash
python --version
# or
python3 --version
```

Expected output: `Python 3.10.x` or higher

**Don't have Python?** Download from: https://www.python.org/downloads/

---

### Check Node.js (18 or higher)
```bash
node --version
```

Expected output: `v18.x.x` or higher

**Don't have Node.js?** Download from: https://nodejs.org/

---

### Check npm (comes with Node.js)
```bash
npm --version
```

Expected output: `9.x.x` or higher

---

## Step 2: Clone the Repository (If not already done)

```bash
git clone https://github.com/jatin-chimote/copilotkit-agui-poc.git
cd copilotkit-agui-poc
```

---

## Step 3: Backend Setup

### 3.1 Navigate to Backend
```bash
cd backend
```

### 3.2 Create Virtual Environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (Command Prompt):**
```bash
python -m venv venv
venv\Scripts\activate
```

**On Windows (PowerShell):**
```bash
python -m venv venv
venv\Scripts\Activate.ps1
```

You should see `(venv)` appear in your terminal prompt.

### 3.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn
- SQLAlchemy
- LangChain
- LangGraph
- OpenAI Python SDK
- And other dependencies

**Expected time:** 1-2 minutes

### 3.4 Configure Environment Variables

The `.env` file should already exist with your API key. Verify it:

**On macOS/Linux:**
```bash
cat .env
```

**On Windows:**
```bash
type .env
```

You should see:
```
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=sqlite:///./data_mapper.db
```

**If `.env` doesn't exist:**
```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:
```bash
# macOS/Linux
nano .env

# Windows
notepad .env
```

### 3.5 Start the Backend Server
```bash
python -m uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Backend is running!** ✅

Test it: Open http://localhost:8000 in your browser
- You should see: `{"message": "Data Mapper Agent API", ...}`

**Leave this terminal running** and open a new terminal for the frontend.

---

## Step 4: Frontend Setup (New Terminal)

### 4.1 Navigate to Frontend
```bash
cd copilotkit-agui-poc/frontend
```

### 4.2 Install Node Dependencies
```bash
npm install
```

This will install:
- React
- Vite
- CopilotKit
- TanStack Query
- Zustand
- TypeScript
- And other dependencies

**Expected time:** 1-3 minutes

**If you see warnings:** That's normal, ignore them unless there are errors.

### 4.3 Start the Frontend Dev Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Frontend is running!** ✅

### 4.4 Open the Application

Open your browser and go to: **http://localhost:3000**

You should see the Data Mapper Agent interface!

---

## Step 5: Verify Everything Works

### Backend Check
1. Open http://localhost:8000/docs
2. You should see the Swagger API documentation
3. Try the `/health` endpoint - it should return `{"status": "healthy"}`

### Frontend Check
1. The app should load at http://localhost:3000
2. You should see:
   - Header: "Data Mapper Agent"
   - Sidebar: "Projects" with a "New" button
   - Empty state message

---

## Step 6: Create Your First Project

### 6.1 Create a Project
1. Click **"New"** in the Projects sidebar
2. Fill in the form:
   - **Project Name:** `Purchase Orders`
   - **Description:** `Standard purchase order schema`
   - **Destination Schema:**
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
3. Click **"Create Project"**

### 6.2 Add a Vendor Schema
1. Select your "Purchase Orders" project
2. Click **"Add Vendor"**
3. Fill in the form:
   - **Schema Name:** `Vendor A Schema`
   - **Vendor Name:** `Acme Corp`
   - **Source Schema:**
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
4. Click **"Add Vendor"**

### 6.3 Map with AI
1. Click on the vendor schema you just created
2. You'll see side-by-side schemas
3. In the chat box at the bottom, type:
   ```
   Map all columns intelligently
   ```
4. Click **"Send to Agent"**
5. Wait 3-5 seconds for the AI to respond
6. You'll see:
   - Suggested mappings with green highlights
   - Confidence score
   - AI explanation

**Success!** 🎉 You've completed your first AI-powered schema mapping!

---

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Port 8000 already in use"
**Solution:** Kill the process using port 8000:
```bash
# macOS/Linux
lsof -ti:8000 | xargs kill

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

Or run on a different port:
```bash
python -m uvicorn app.main:app --reload --port 8001
```

### Issue: "Port 3000 already in use"
**Solution:** The Vite dev server will automatically try port 3001, 3002, etc.

Or specify a port:
```bash
npm run dev -- --port 3001
```

### Issue: "OpenAI API Error"
**Solution:**
1. Check your API key in `backend/.env`
2. Verify the key is valid at https://platform.openai.com/api-keys
3. Make sure you have credits in your OpenAI account

### Issue: Backend starts but shows errors about database
**Solution:** Delete and recreate the database:
```bash
cd backend
rm -f data_mapper.db  # or del data_mapper.db on Windows
python -m uvicorn app.main:app --reload
```

### Issue: Frontend shows "Failed to fetch"
**Solution:**
1. Verify backend is running on http://localhost:8000
2. Check browser console for CORS errors
3. Make sure both servers are running

---

## Stopping the Application

### Stop Backend
In the backend terminal, press: **Ctrl + C**

### Stop Frontend
In the frontend terminal, press: **Ctrl + C**

### Deactivate Python Virtual Environment
```bash
deactivate
```

---

## Restarting the Application

### Quick Restart (if dependencies already installed)

**Terminal 1 - Backend:**
```bash
cd copilotkit-agui-poc/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd copilotkit-agui-poc/frontend
npm run dev
```

### Or Use the Start Script
```bash
cd copilotkit-agui-poc
./start.sh  # macOS/Linux
```

---

## Development Tips

### Hot Reload
Both backend and frontend support hot reload:
- **Backend:** Changes to Python files automatically restart the server
- **Frontend:** Changes to React/TypeScript files automatically update the browser

### View Logs
- **Backend logs:** Check the terminal running uvicorn
- **Frontend logs:** Check browser developer console (F12)
- **Network requests:** Browser DevTools → Network tab

### Database Management
The SQLite database file is at: `backend/data_mapper.db`

View it with:
- DB Browser for SQLite: https://sqlitebrowser.org/
- Or any SQLite viewer

### API Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

---

## Next Steps

1. ✅ **Create multiple projects** for different data types
2. ✅ **Add multiple vendors** to see how the AI handles various schemas
3. ✅ **Experiment with the chat** - ask the AI different questions about mappings
4. ✅ **Check the confidence scores** - higher is better
5. ✅ **Refine mappings** by providing feedback to the AI

---

## Getting Help

- **API Documentation:** http://localhost:8000/docs
- **Main README:** [README.md](./README.md)
- **Cloud Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)

---

## You're All Set! 🚀

Your local development environment is ready. Start mapping schemas with AI!
