# Duolingo Web App Clone

A full-stack, visually and functionally near-identical clone of the Duolingo language learning web app built for an SDE Fullstack evaluation. 

The application runs end-to-end with pre-seeded data, featuring a snake-style winding learning path, 5 interactive exercise types, real timestamp-based heart regeneration, unit-testable daily streak logic, learner profiles, weekly leaderboards, and gamification achievements.

---

## Tech Stack

- **Frontend:** Next.js 14 (TypeScript, App Router, Tailwind CSS, Lucide Icons, Canvas-Confetti)
- **Backend:** Django 5 + Django REST Framework (DRF)
- **Database:** SQLite (Normalized relational schema)
- **Styling & Aesthetics:** Duolingo signature palette (`#58CC02` Green, `#1CB0F6` Blue, `#FFC800` Gold, `#FF4B4B` Red, `#CE82FF` Purple), Nunito Google typography, chunky 3D buttons, custom original SVG mascot owl.

---

## Quick Start & First-Run Setup

### 1. Backend Setup (Django + DRF)

```bash
cd backend

# Option A: System Python or Virtual Environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install django djangorestframework django-cors-headers

# Run database migrations
python manage.py migrate

# Seed initial course data (Spanish course, 4 units, skills, 2-3 lessons/skill, 5-8 exercises/lesson, learners, achievements)
python manage.py seed_data

# Run backend unit tests
python manage.py test api

# Start Django development server (runs on http://localhost:8000)
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup (Next.js 14)

In a separate terminal:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema & Foreign Key Relationships

The database schema is fully normalized in Django (`backend/api/models.py`):

```mermaid
erDiagram
    Language ||--o{ Unit : contains
    Unit ||--o{ Skill : contains
    Skill ||--o{ Lesson : contains
    Lesson ||--o{ Exercise : contains
    User ||--o| UserStats : has
    User ||--o{ UserProgress : tracks
    User ||--o{ UserLessonAttempt : logs
    User ||--o| LeaderboardEntry : ranks
    User ||--o{ UserAchievement : unlocks
    Achievement ||--o{ UserAchievement : standard

    Language {
        int id PK
        string code
        string name
        string flag_icon
    }
    Unit {
        int id PK
        int language_id FK
        string title
        string description
        int order
        string hex_color
    }
    Skill {
        int id PK
        int unit_id FK
        string title
        string icon
        int order
        int total_crowns
    }
    Lesson {
        int id PK
        int skill_id FK
        string title
        int order
        int xp_reward
    }
    Exercise {
        int id PK
        int lesson_id FK
        string type
        string prompt
        int order
        json content
    }
    UserStats {
        int id PK
        int user_id FK
        int xp
        int streak
        date last_active_date
        int hearts
        int max_hearts
        datetime last_heart_loss_timestamp
        int gems
        int daily_xp_goal
        int daily_xp_today
    }
    UserProgress {
        int id PK
        int user_id FK
        int skill_id FK
        int completed_lessons
        int current_crown
        boolean is_unlocked
        boolean is_completed
    }
    UserLessonAttempt {
        int id PK
        int user_id FK
        int lesson_id FK
        int score
        int hearts_lost
        int xp_earned
        datetime completed_at
    }
    LeaderboardEntry {
        int id PK
        int user_id FK
        int weekly_xp
        string league
        int rank
    }
    Achievement {
        int id PK
        string title
        string description
        string icon
        int max_progress
    }
    UserAchievement {
        int id PK
        int user_id FK
        int achievement_id FK
        int current_progress
        boolean is_unlocked
    }
```

### Cascading & Foreign Key Logic
- `Unit` -> `Language` (CASCADE): Deleting a language removes its units.
- `Skill` -> `Unit` (CASCADE): Deleting a unit removes associated skills.
- `Lesson` -> `Skill` (CASCADE): Deleting a skill removes all contained lessons.
- `Exercise` -> `Lesson` (CASCADE): Exercises are bound to their lesson parent.
- `UserProgress`, `UserLessonAttempt`, `UserStats`, `LeaderboardEntry`, `UserAchievement`: Cascade on `User` deletion to ensure cleanup of learner data.

---

## API Overview Table

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/path/` | Returns learning path (units -> skills) with lock/unlock and learner progress state. |
| `GET` | `/api/skills/:id/lesson/` | Fetches lesson payload and ordered sequence of exercises for a skill. |
| `POST` | `/api/lessons/:id/complete/` | Submits lesson results (`score`, `hearts_lost`), awards XP, updates streak, unlocks next skill. |
| `GET` | `/api/user/stats/` | Returns learner stats (XP, streak, hearts recalculated with real timestamp regen, gems). |
| `POST` | `/api/user/hearts/refill/` | Instantly refills hearts to maximum (5/5). |
| `GET` | `/api/leaderboard/` | Returns weekly leaderboard entries across seeded users. |
| `GET` | `/api/user/profile/` | Returns user stats + unlocked achievement badges for profile page. |
| `GET` | `/api/achievements/` | Returns list of all system achievements and progress. |

---

## Features & Implementation Details

1. **5 Interactive Exercise Types**:
   - *Multiple Choice*: Select single correct translation option.
   - *Translate / Word Bank*: Tap word tiles to assemble sentence in order.
   - *Match Pairs*: Grid matching left/right term pairs.
   - *Fill in the Blank*: Select missing word tile to complete sentence.
   - *Type the Answer*: Free text input with case-insensitive whitespace tolerance.
2. **Real Timestamp-Based Hearts Regeneration**:
   - Automatically regenerates 1 heart every 60 minutes after heart loss.
   - Out of hearts modal allows free instant refill or practice mode.
3. **Unit-Testable Streak Calculation**:
   - `update_user_streak` supports date parameter injection for unit testing consecutive activity and missed day resets.
4. **Gamification & UI Flourishes**:
   - Serpentine snaking skill tree with alternating bubble offsets.
   - Timed *Legendary Challenge Mode* toggle for double XP (+20 XP).
   - Animated bottom slide-up drawer for correct/incorrect answer feedback.
   - Confetti celebration modal upon lesson completion.
   - Original SVG mascot owl ("Duo" inspired).
   - Dark mode toggle and responsive layout.

---

## Google OAuth Setup

Google sign-in uses **Google Identity Services** on the frontend and verifies the ID token on the backend.

### 1. Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or select an existing one)
3. **APIs & Services → OAuth consent screen** → configure (External is fine for testing)
4. **Credentials → Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `https://duolingo-clone-liart.vercel.app`
7. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)

### 2. Set environment variables

**Frontend** (`frontend/.env.local` and Vercel):

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Backend** (`backend/.env` and Render):

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Use the **same Client ID** on both frontend and backend.

### 3. Redeploy

- Push to GitHub → Vercel redeploys frontend
- Render redeploys backend after adding `GOOGLE_CLIENT_ID` in Environment

**API:** `POST /api/auth/google/` with body `{ "id_token": "<google credential>" }`

---

## Django Admin (Database UI)

Browse and edit SQLite data in a web UI at **`/admin/`**.

### Local setup

```bash
cd backend
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Open [http://localhost:8000/admin/](http://localhost:8000/admin/) and log in with your superuser account.

**Useful sections:**
- **Users** — new signups (`date_joined`, `last_login`)
- **User stats** — XP, streak, hearts per learner
- **User progress** — skill unlock/completion state
- **User lesson attempts** — completed lessons
- **Languages / Units / Skills / Lessons / Exercises** — course content

### Production (Render) — no Shell required

Render Shell may require a paid plan. Use **live Django Admin** in your browser instead:

1. Render Dashboard → your backend → **Environment**
2. Add these variables (then save — triggers redeploy):

| Key | Value |
|---|---|
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_PASSWORD` | *choose a strong password* |
| `DJANGO_SUPERUSER_EMAIL` | *optional* |

3. After redeploy finishes, open:

   **https://duolingo-clone-6092.onrender.com/admin/**

4. Log in → **Users** → real signups from your live site appear here.

Refresh the page to see new users after someone registers on Vercel.

> **Render free tier note:** SQLite on free tier may reset when the service redeploys or sleeps for a long time. For permanent production data, use a free PostgreSQL database ([Neon](https://neon.tech) or [Supabase](https://supabase.com)) and set `DATABASE_URL` on Render.

### Production (Render Shell — if available on your plan)

### Alternative: DB Browser for SQLite

For raw file access locally, open `backend/db.sqlite3` in [DB Browser for SQLite](https://sqlitebrowser.org/).  
Live Render data is **not** in your local file — use Django Admin on Render for production users.

---

## Deployment Configuration

- Backend Deployment: `backend/render.yaml` (compatible with Render / Railway)
- Frontend Deployment: `frontend/vercel.json` (compatible with Vercel with `NEXT_PUBLIC_API_URL` environment variable)
