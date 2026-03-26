# SkillPath 🚀

**AI-powered learning roadmap generator** — Enter any skill, get a personalised step-by-step plan built from the internet's best resources. Track progress as you go.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Python FastAPI |
| Database | Supabase (Postgres) |
| AI | Google Gemini API (`gemini-1.5-flash`) |

---

## 1. Install Dependencies

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

---

## 2. Set Up Supabase Tables

Go to **Supabase → SQL Editor** and run the following:

```sql
-- Table: roadmaps
CREATE TABLE roadmaps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  skill         text NOT NULL,
  level         text NOT NULL,
  hours_per_day float NOT NULL,
  roadmap_json  jsonb NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- Table: progress
CREATE TABLE progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text NOT NULL,
  roadmap_id   uuid NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  resource_url text NOT NULL,
  completed    boolean DEFAULT false,
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, roadmap_id, resource_url)
);
```

---

## 3. Fill In Environment Variables

### Backend — create `backend/.env` (copy from `.env.example`)

```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

- Get **GEMINI_API_KEY** → https://aistudio.google.com/app/apikey
- Get **SUPABASE_URL** and **SUPABASE_KEY** → Supabase Dashboard → Project Settings → API

### Frontend — `frontend/.env` is already configured

```env
VITE_API_URL=http://localhost:8000
```

Change `VITE_API_URL` if deploying the backend to a different host.

---

## 4. Run the Backend

```bash
cd backend
uvicorn main:app --reload
```

API will be available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

---

## 5. Run the Frontend

```bash
cd frontend
npm run dev
```

App will be available at `http://localhost:5173`

---

## 6. Test the App

1. Open `http://localhost:5173` in your browser
2. Type a skill (e.g. **"Python"**) or click one of the quick chips
3. Choose your level and daily time
4. Click **"Build My Roadmap →"**
5. Wait ~10–20 seconds while Gemini generates your roadmap
6. You'll be taken to your personalised roadmap page
7. Click the circle next to any resource to mark it complete
8. Watch the progress bar fill up in real time

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/generate-roadmap` | Generate + save a roadmap |
| `GET` | `/api/roadmap/{id}` | Fetch a single roadmap |
| `GET` | `/api/user/{user_id}/roadmaps` | Fetch all user roadmaps |
| `POST` | `/api/progress` | Save/update resource progress |
| `GET` | `/api/progress/{user_id}/{roadmap_id}` | Get all progress for a roadmap |
| `DELETE` | `/api/roadmap/{id}` | Delete roadmap + its progress |

---

## Project Structure

```
app/
├── backend/
│   ├── main.py          # FastAPI app + CORS
│   ├── routes.py        # All API route handlers
│   ├── ai.py            # Gemini API integration
│   ├── database.py      # Supabase CRUD functions
│   ├── models.py        # Pydantic request/response models
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx              # Router setup
    │   ├── main.jsx             # React entry point
    │   ├── index.css            # Global styles + Tailwind
    │   ├── api/index.js         # All API fetch functions
    │   └── pages/
    │       ├── HomePage.jsx     # Landing page + form
    │       └── RoadmapPage.jsx  # Roadmap + progress tracking
    ├── index.html
    ├── vite.config.js
    ├── .env
    └── .env.example
```
