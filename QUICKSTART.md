# 🚀 Quick Start Guide

Your Data Mapper Agent is ready to run! Here's how to get started:

## ✅ Environment Setup Complete

Your OpenAI API key has been configured in `backend/.env`

---

## Option 1: Run Locally (If Dependencies Installed)

### Start Everything with One Command:
```bash
./start.sh
```

This will:
- Start the backend on http://localhost:8000
- Start the frontend on http://localhost:3000
- Open API docs at http://localhost:8000/docs

### Or Run Manually:

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Option 2: GitHub Codespaces (No Installation)

1. Go to your GitHub repository
2. Click **Code** → **Codespaces** → **Create codespace**
3. Wait 2-3 minutes for setup
4. The app auto-starts!
5. Set your API key in the Codespace:
   ```bash
   echo "OPENAI_API_KEY=YOUR_KEY_HERE" > backend/.env
   ```
6. Restart the backend
7. Open port 3000

---

## Option 3: Gitpod (Fastest Cloud Option)

1. Visit: `https://gitpod.io/#https://github.com/YOUR_USERNAME/copilotkit-agui-poc`
2. Wait for workspace to load
3. Set API key:
   ```bash
   echo "OPENAI_API_KEY=YOUR_KEY_HERE" > backend/.env
   ```
4. Services start automatically
5. Click "Open Browser" on port 3000

---

## Option 4: Railway (Production Deploy)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
5. Deploy!
6. Get your production URL

---

## 🎯 First Steps After Starting

1. **Create a Project**
   - Click "New" in the Projects sidebar
   - Name it "Purchase Orders" (example)
   - Define destination schema:
   ```json
   {
     "order_id": "string",
     "vendor": "string",
     "date": "date",
     "amount": "number",
     "status": "string"
   }
   ```

2. **Add a Vendor Schema**
   - Select your project
   - Click "Add Vendor"
   - Name: "Vendor A"
   - Source schema (their format):
   ```json
   {
     "po_num": "string",
     "supplier_name": "string",
     "created": "datetime",
     "total": "decimal",
     "state": "string"
   }
   ```

3. **Map with AI**
   - Select the vendor schema
   - Chat with the agent:
     - "Map all columns intelligently"
     - "Map po_num to order_id"
     - "Which columns need attention?"
   - Review the mappings
   - See confidence scores

---

## 📍 Access Points

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Interactive API:** http://localhost:8000/redoc

---

## 🔒 Security Reminder

**IMPORTANT:** After testing, rotate your OpenAI API key:
1. Go to https://platform.openai.com/api-keys
2. Create a new key
3. Delete the old key
4. Update `backend/.env` with the new key

Never commit `.env` files to git (already configured in `.gitignore`)

---

## 🆘 Troubleshooting

**Backend won't start:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend won't start:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Database errors:**
```bash
cd backend
rm data_mapper.db  # Reset database
python -m uvicorn app.main:app --reload
```

**API key errors:**
- Check `backend/.env` exists
- Verify the key starts with `sk-`
- Make sure there are no quotes around the key

---

## 📚 Need More Help?

- **Full Documentation:** See [README.md](./README.md)
- **Cloud Deployment:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Reference:** http://localhost:8000/docs (when running)

---

## 🎉 You're All Set!

Your Data Mapper Agent is ready to intelligently map vendor schemas to your standardized format using AI.

Happy mapping! 🚀
