Free Backend Deployment Guide (Render + Neon)

Overview
- Frontend stays on Vercel.
- Backend deploys to Render free web service.
- PostgreSQL uses Neon free database.

1) Create free Postgres on Neon
- Sign in at neon.tech.
- Create a project and database.
- Copy the full connection string, for example:
  - postgresql://user:password@host/dbname?sslmode=require

2) Deploy backend on Render
- Push this repo to GitHub if not already pushed.
- In Render, click New + then Blueprint.
- Select your repo. Render will detect render.yaml at repo root.
- Create the service.

3) Set backend environment variables in Render
- DATABASE_URL = your full Neon connection string
- FRONTEND_URL = your Vercel frontend URL (for example https://your-app.vercel.app)
- SECRET_KEY = any long random string (auto-generated if using blueprint)
- BANK_NAME = State Bank of India (or your preferred label)

4) Verify backend health
- Open your Render URL in browser:
  - https://your-render-service.onrender.com/
- Expected JSON response with status ok.
- Optional docs endpoint:
  - https://your-render-service.onrender.com/docs

5) Connect frontend on Vercel
- In Vercel project settings, add:
  - REACT_APP_API_BASE = https://your-render-service.onrender.com
- Redeploy frontend.

6) Test from deployed frontend
- Open frontend on Vercel.
- Try login and complaint list.
- If requests fail, check browser network tab for CORS or 5xx errors.

Notes
- Free Render instances may sleep after inactivity and wake on first request.
- Current backend runtime uses mock AI services; no heavy GPU/LLM runtime is required for deployment.
- If you later enable real transformer or torch workloads, move to a paid compute tier.
