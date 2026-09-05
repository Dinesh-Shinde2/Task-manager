# Production Deployment Guide (Vercel + Render + Cloud Database)

This step-by-step guide walks you through deploying your **Task Manager** application live for free:
- **Frontend**: [Vercel](https://vercel.com) (React + Vite SPA)
- **Backend**: [Render.com](https://render.com) (Python FastAPI Web Service)
- **Database**: [Supabase](https://supabase.com) or [Neon.tech](https://neon.tech) (Free PostgreSQL Database)

---

## Step 1: Set Up Free Cloud Database (Supabase / Neon)

1. Sign up for a free account at [Supabase.com](https://supabase.com) or [Neon.tech](https://neon.tech).
2. Create a new project named `task-manager-db`.
3. Copy your **PostgreSQL Connection String**:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   *(SQLAlchemy inside FastAPI will automatically create all tables and populate `dinesh2202` admin on first startup!)*

---

## Step 2: Deploy Python Backend to Render.com

1. Push your repository to **GitHub**.
2. Log in to [Render.com](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure Web Service settings:
   - **Name**: `task-manager-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add **Environment Variables** in Render settings:
   - `DATABASE_URL` = `postgresql://postgres....` (from Step 1)
   - `SECRET_KEY` = `your-super-secret-jwt-key-2026`
7. Click **Create Web Service**. Render will deploy your API and provide a live URL, e.g.:
   `https://task-manager-9luq.onrender.com`

---

## Step 3: Deploy React Frontend to Vercel

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project** and import your GitHub repository.
3. Configure Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable** in Vercel settings (optional, since frontend now defaults to this automatically):
   - `VITE_API_BASE_URL` = `https://task-manager-9luq.onrender.com/api`
5. Click **Deploy**.
6. Vercel will give you your live URL, e.g.: `https://task-manager.vercel.app`!

---

## Step 4: Verification

1. Open your Vercel URL (`https://task-manager.vercel.app`).
2. Log in with:
   - **User ID**: `dinesh2202`
   - **Password**: `dinesh2202`
3. Enjoy your live production Task Manager application!
