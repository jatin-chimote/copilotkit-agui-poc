# Troubleshooting Guide

Common issues and solutions for Data Mapper Agent setup.

---

## Backend Issues

### ❌ Error: "No module named uvicorn"

**Cause:** Dependencies not installed or virtual environment not activated.

**Solution:**

**Windows:**
```bash
cd backend
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**macOS/Linux:**
```bash
cd backend
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Still not working?** Delete and recreate the virtual environment:

```bash
# Windows
cd backend
rmdir /s /q venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# macOS/Linux
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### ❌ Error: "python: command not found"

**Windows Solution:**
1. Download Python from https://www.python.org/downloads/
2. During installation, **check "Add Python to PATH"**
3. Restart your terminal
4. Verify: `python --version`

**macOS Solution:**
```bash
# Install using Homebrew
brew install python@3.11
```

**Linux Solution:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Fedora
sudo dnf install python3.11
```

---

### ❌ Error: "Cannot activate virtual environment"

**Windows PowerShell - Execution Policy Error:**

If you see: `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again:
```powershell
venv\Scripts\Activate.ps1
```

**Alternative:** Use Command Prompt instead of PowerShell:
```bash
venv\Scripts\activate.bat
```

---

### ❌ Error: "ModuleNotFoundError: No module named 'app'"

**Cause:** Running uvicorn from wrong directory.

**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Then run
python -m uvicorn app.main:app --reload
```

---

### ❌ Error: "Port 8000 already in use"

**Windows Solution:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

**macOS/Linux Solution:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Or run on different port:**
```bash
python -m uvicorn app.main:app --reload --port 8001
```

---

### ❌ Error: "OpenAI API Error" or "Invalid API Key"

**Solutions:**

1. **Check .env file exists:**
   ```bash
   # Windows
   dir .env

   # macOS/Linux
   ls -la .env
   ```

2. **Verify .env contents:**
   ```bash
   # Windows
   type .env

   # macOS/Linux
   cat .env
   ```

   Should show:
   ```
   OPENAI_API_KEY=sk-proj-...
   DATABASE_URL=sqlite:///./data_mapper.db
   ```

3. **No quotes around the API key:**
   ```bash
   # ❌ Wrong
   OPENAI_API_KEY="sk-proj-..."

   # ✅ Correct
   OPENAI_API_KEY=sk-proj-...
   ```

4. **Verify API key is valid:**
   - Go to https://platform.openai.com/api-keys
   - Check if the key exists and is active
   - Create a new key if needed

5. **Check OpenAI account has credits:**
   - Go to https://platform.openai.com/account/billing
   - Verify you have available credits

---

### ❌ Error: "Database locked" or "SQLite errors"

**Solution:**
```bash
cd backend

# Delete the database file
# Windows
del data_mapper.db

# macOS/Linux
rm -f data_mapper.db

# Restart the server (it will recreate the database)
python -m uvicorn app.main:app --reload
```

---

## Frontend Issues

### ❌ Error: "npm: command not found"

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install the LTS version
3. Restart your terminal
4. Verify: `node --version` and `npm --version`

---

### ❌ Error: "npm install" fails or hangs

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   # Windows
   cd frontend
   rmdir /s /q node_modules
   del package-lock.json
   npm install

   # macOS/Linux
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use alternative package manager:**
   ```bash
   # Try with yarn
   npm install -g yarn
   yarn install
   ```

---

### ❌ Error: "Port 3000 already in use"

**Solution:** Vite will automatically try the next available port (3001, 3002, etc.)

Or specify a different port:
```bash
npm run dev -- --port 3001
```

**To kill process on port 3000:**

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

### ❌ Error: "Failed to fetch" in browser console

**Causes & Solutions:**

1. **Backend not running:**
   - Start the backend: `python -m uvicorn app.main:app --reload`
   - Verify it's running: http://localhost:8000

2. **CORS issues:**
   - Already configured in `backend/app/main.py`
   - Make sure backend is on port 8000
   - Check browser console for CORS errors

3. **Wrong API URL:**
   - Frontend expects backend at http://localhost:8000
   - Check `frontend/vite.config.ts` proxy settings

---

### ❌ Error: TypeScript compilation errors

**Solution:**
```bash
cd frontend

# Delete TypeScript cache
# Windows
rmdir /s /q node_modules\.vite

# macOS/Linux
rm -rf node_modules/.vite

# Reinstall
npm install

# Try building
npm run build
```

---

## General Issues

### ❌ "It works locally but not in production"

**Environment Variables:**
- Make sure `OPENAI_API_KEY` is set in production environment
- Check platform-specific env var settings:
  - Railway: Settings → Variables
  - Render: Environment → Environment Variables
  - Vercel: Settings → Environment Variables

**Database:**
- SQLite doesn't work well on some platforms (Vercel, etc.)
- Consider using PostgreSQL for production
- Railway/Render automatically provide PostgreSQL

---

### ❌ Git issues

**Error: "fatal: not a git repository"**
```bash
cd copilotkit-agui-poc
git init
git remote add origin https://github.com/jatin-chimote/copilotkit-agui-poc.git
```

**Error: "Permission denied (publickey)"**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/jatin-chimote/copilotkit-agui-poc.git
```

---

## Windows-Specific Issues

### Python not in PATH

**Solution:**
1. Find Python installation location:
   ```bash
   where python
   ```

2. Add to PATH manually:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add Python directory (e.g., `C:\Python311\`)
   - Add Scripts directory (e.g., `C:\Python311\Scripts\`)

### Virtual environment won't activate

**Use Command Prompt instead of PowerShell:**
```bash
# Command Prompt
venv\Scripts\activate.bat

# Not PowerShell (unless you change execution policy)
```

---

## Quick Diagnostic Commands

Run these to check your setup:

```bash
# Check Python
python --version

# Check Node
node --version

# Check npm
npm --version

# Check pip
pip --version

# Check if in virtual environment (should see (venv) in prompt)
# Windows
where python

# macOS/Linux
which python

# List installed Python packages
pip list

# Check backend is running
curl http://localhost:8000

# Check frontend is running
curl http://localhost:3000
```

---

## Still Having Issues?

### Get Detailed Logs

**Backend:**
```bash
# Run with verbose logging
python -m uvicorn app.main:app --reload --log-level debug
```

**Frontend:**
```bash
# Check browser console (F12)
# Look for errors in:
# - Console tab
# - Network tab
```

### Use Cloud Instead

If local setup is too problematic, use a cloud option:
- **GitHub Codespaces:** Zero setup, works in browser
- **Gitpod:** One-click cloud environment
- See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Common Setup Mistakes

1. ❌ Not activating virtual environment before installing packages
2. ❌ Running uvicorn outside the backend directory
3. ❌ Forgetting to create `.env` file
4. ❌ Using quotes around API key in `.env`
5. ❌ Not having OpenAI credits
6. ❌ PowerShell execution policy blocking activation
7. ❌ Port already in use from previous run
8. ❌ Wrong Python or Node version

---

## Need More Help?

1. Check the [LOCAL_SETUP.md](./LOCAL_SETUP.md) guide
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud options
3. Check the [README.md](./README.md) for architecture details
4. Open an issue on GitHub with:
   - Your OS and versions (`python --version`, `node --version`)
   - Full error message
   - Steps you've tried
