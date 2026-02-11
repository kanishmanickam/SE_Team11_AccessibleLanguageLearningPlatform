# Accessible Language Learning Platform

An accessible MERN language-learning platform designed to support learners with dyslexia, ADHD, and autism.

## 1) Project overview

This system provides condition-aware lesson delivery, interaction practice, and progress tracking.

Key capabilities in this repository:
- Condition-specific learning experiences (Dyslexia / ADHD / Autism) in the React UI.
- JWT-based authentication and protected APIs.
- User accessibility preferences persisted in MongoDB and applied on the frontend.
- Lesson content with sections and interactive questions.
- Progress persistence (resume where you left off) + progress summary.
- Audio support via:
    - File audio URLs when available
    - Backend Text-to-Speech endpoint (`/api/tts/speak`) with browser fallback
- Optional Gemini-powered quiz generation endpoints with safe fallbacks.

Developer docs (architecture, API, schema, standards, deployment, troubleshooting):
- ARCHITECTURE.md
- API.md
- DATABASE_SCHEMA.md
- CODING_STANDARDS.md
- DEPLOYMENT.md
- TROUBLESHOOTING.md

## 2) Setup guide (run locally)

### Prerequisites

- Node.js (recommended: 18+)
- npm
- MongoDB (local) or MongoDB Atlas connection string
- (Optional) Python 3 for the TTS endpoint

### Backend setup

```bash
cd backend
npm install
```

Create a `backend/.env` based on `backend/.env.example`.

Minimal working example:

```dotenv
# IMPORTANT: the frontend dev proxy is configured for 5002.
# Either set PORT=5002 (recommended) or change the proxy in frontend/package.json.
PORT=5002

MONGODB_URI=mongodb://localhost:27017/accessible-learning
JWT_SECRET=replace_me_with_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development

# Optional: Gemini AI endpoints (/api/ai/*)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional: use a specific Python interpreter for TTS (/api/tts/speak)
# PYTHON_EXECUTABLE=../.venv/bin/python
```

Start the backend:

```bash
npm run dev
```

Backend defaults:
- API base: `http://localhost:5002/api`
- Health: `http://localhost:5002/health`

### Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend defaults:
- App: `http://localhost:3000`
- Dev proxy: `frontend/package.json` proxies `/api` to `http://localhost:5002`

If you deploy the frontend separately (no proxy), set `REACT_APP_API_URL` to your backend base URL (example: `https://your-backend/api`).

### Optional: enable Python TTS (gTTS)

The backend endpoint `POST /api/tts/speak` spawns `backend/python_services/tts_gen.py`.

If you see `ModuleNotFoundError: No module named 'gtts'`:

```bash
python3 -m pip install -r backend/python_services/requirements.txt
```

### Build

```bash
cd frontend
npm run build
```https://github.com/sadhanatp14/SE_Team11_AccessibleLanguageLearningPlatform.git