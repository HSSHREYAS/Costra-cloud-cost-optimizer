# Costra — Cloud Cost Optimizer

A full-stack cloud cost estimation and optimization platform built with **FastAPI** (backend) and **React + Vite** (frontend). Costra helps users estimate AWS service costs, compare pricing across regions, and receive intelligent optimization recommendations.

![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **Cost Estimation** — Estimate costs for EC2, S3, RDS, Lambda, and more
- **Multi-Region Comparison** — Compare pricing across AWS regions side-by-side
- **Smart Recommendations** — Get AI-powered suggestions to reduce your cloud spend
- **Currency Conversion** — View costs in your local currency
- **Firebase Authentication** — Secure sign-in with Google OAuth
- **Responsive Design** — Premium glassmorphic UI that works on all devices

---

## 🏗️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Recharts, Axios    |
| Backend   | FastAPI, Pydantic, Boto3, Pandas   |
| Auth      | Firebase Admin SDK + Firebase Auth  |
| Cloud     | AWS Pricing API, EC2 Spot Pricing  |
| Deploy    | Render (Web Service + Static Site)  |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- AWS IAM credentials with `pricing:GetProducts` and `ec2:DescribeSpotPriceHistory`
- Firebase project (optional, for authentication)

### Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env    # fill in your credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # fill in your config
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploy to Render

This repo includes a **`render.yaml`** blueprint for one-click deployment.

### Option 1: Blueprint Deploy (Recommended)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create both services
5. Set the required environment variables in each service's **Environment** tab:

   **Backend (`costra-backend`)**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `FIREBASE_PROJECT_ID`
   - `CORS_ORIGINS` → set to your frontend Render URL (e.g. `https://costra-frontend.onrender.com`)

   **Frontend (`costra-frontend`)**:
   - `VITE_API_BASE_URL` → set to your backend Render URL + `/api/v1` (e.g. `https://costra-backend.onrender.com/api/v1`)
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### Option 2: Manual Deploy

Create two services in Render manually:

**Backend (Web Service)**:
- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Python 3.11

**Frontend (Static Site)**:
- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish Directory: `dist`

---

## 📁 Project Structure

```
Costra-cloud-cost-optimizer/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routes (estimate, compare, health)
│   │   ├── auth/         # Firebase authentication
│   │   ├── core/         # Config, error handling
│   │   ├── engines/      # Cost estimation & recommendation engines
│   │   ├── integrations/ # AWS API integration
│   │   ├── modeling/     # Pydantic schemas
│   │   ├── services/     # Business logic layer
│   │   └── main.py       # App entry point
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/          # App shell & routing
│   │   ├── auth/         # Auth context & Firebase
│   │   ├── components/   # Charts, forms
│   │   ├── pages/        # Landing, Dashboard, Compare, Login
│   │   ├── services/     # API client
│   │   ├── hooks/        # Custom hooks
│   │   └── styles/       # Global CSS
│   ├── package.json
│   └── vite.config.js
├── render.yaml           # Render deployment blueprint
└── README.md
```

---

## 📄 License

MIT — feel free to use this project for learning and personal projects.
