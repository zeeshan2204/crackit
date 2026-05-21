# 🤖 InterviewAI — AI-Powered Mock Interview Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-316192?style=for-the-badge&logo=postgresql)
![Groq](https://img.shields.io/badge/Groq-LLaMA3-orange?style=for-the-badge)

**A full-stack AI-powered coding interview preparation platform — Final Year Project**

[Live Demo](#) · [API Docs](#api-documentation) · [Features](#features) · [Setup](#setup)

</div>

---

## 📌 Overview

InterviewAI is a production-ready mock interview platform that simulates real technical interviews. Users solve coding problems in a Monaco-based code editor and receive instant AI-powered feedback evaluating their solution across multiple dimensions — just like a real interviewer would.

Built with a **Python FastAPI backend**, **React frontend**, **PostgreSQL database**, and **Groq LLaMA3 AI** for intelligent code evaluation and conversational feedback.

---

## ✨ Features

### 🔐 Authentication
- JWT-based auth with Access + Refresh token flow (15min + 7 days)
- Email/Password registration and login
- Google OAuth 2.0 integration
- **Demo Mode** — try the platform without signing up

### 💻 Interview Experience
- **Monaco Editor** (VS Code engine) with full syntax highlighting
- Multi-language support — Python 3, JavaScript, Java
- Live countdown timer with pause/resume
- 5 curated problems: Arrays, DP, Stack, Searching, Sliding Window

### 🤖 AI-Powered Feedback
- Real-time code evaluation via **Groq LLaMA3-70B**
- 4-dimensional scoring: Correctness, Efficiency, Readability, Edge Cases
- Detailed strengths and improvement suggestions
- Interactive AI Interviewer chat for follow-up questions

### 📊 Analytics Dashboard
- Score progression over time (Recharts line chart)
- Topic-wise performance bar chart
- Full session history with time taken
- Streak tracking

### 🎨 UI/UX
- Dark / Light theme toggle
- 3-panel layout — Problem · Editor · Feedback
- Auto-generated Swagger API documentation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Monaco Editor, Recharts |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **Database** | PostgreSQL 17, SQLAlchemy (async) |
| **Auth** | JWT (python-jose), bcrypt, Google OAuth |
| **AI** | Groq API — LLaMA3-70B-8192 |
| **Hosting** | Vercel (frontend), Railway (backend), Neon (DB) |

---

## 📁 Project Structure

```
ai-mock-interview/
│
├── frontend/                      # React + Vite
│   └── src/
│       ├── pages/
│       │   ├── AuthPage.jsx       # Login, Register, Demo mode
│       │   └── InterviewPage.jsx  # Main 3-panel interview UI
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth + demo state
│       ├── hooks/
│       │   └── useInterview.js    # Core interview logic
│       └── api/
│           ├── client.js          # Axios + auto token refresh
│           ├── auth.js
│           └── problems.js
│
└── backend/                       # FastAPI + Python
    ├── seed.py                    # Populate DB with problems
    └── app/
        ├── main.py                # App entry + CORS + routes
        ├── config.py              # Pydantic settings
        ├── database.py            # Async SQLAlchemy engine
        ├── models/
        │   ├── models.py          # User, Problem, Submission, Feedback
        │   └── schemas.py         # Pydantic request/response schemas
        ├── routes/
        │   ├── auth.py            # /api/auth/*
        │   ├── problems.py        # /api/problems/*
        │   ├── submissions.py     # /api/submissions/*
        │   └── ai.py              # /api/ai/chat
        ├── services/
        │   ├── ai_service.py      # Groq LLaMA3 integration
        │   └── token_service.py   # JWT sign/verify
        └── middleware/
            └── auth_middleware.py # JWT Depends() guard
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Neon free tier)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/zeeshan2204/ai-mock-interview.git
cd ai-mock-interview
```

### 2. Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and fill in your values

# Seed problems into database
python seed.py

# Start backend server
uvicorn app.main:app --reload --port 4000
```

### 3. Frontend setup
```bash
cd frontend
npm install

cp .env.example .env
# Set VITE_API_URL=http://localhost:4000/api

npm run dev
```

### 4. Open in browser
```
Frontend  →  http://localhost:5173
API Docs  →  http://localhost:4000/docs
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname?sslmode=require
JWT_SECRET=your_random_secret_key
JWT_REFRESH_SECRET=another_random_secret_key
GROQ_API_KEY=gsk_your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📡 API Documentation

FastAPI auto-generates interactive Swagger docs at `http://localhost:4000/docs`

```
POST /api/auth/register          Register new user
POST /api/auth/login             Login with email/password
POST /api/auth/google            Google OAuth login
POST /api/auth/refresh           Refresh access token
GET  /api/auth/me                Get current user

GET  /api/problems               Get all problems
GET  /api/problems/{id}          Get single problem

POST /api/submissions            Submit code → AI feedback
GET  /api/submissions/history    User's past submissions
GET  /api/submissions/stats      Analytics data

POST /api/ai/chat                Chat with AI interviewer
```

---

## 🗄️ Database Schema

```
users          → id, email, name, password_hash, google_id, avatar, theme
problems       → id, title, description, difficulty, topic, examples, starter_code
submissions    → id, user_id (FK), problem_id (FK), code, language, time_taken
feedback       → id, submission_id (FK), correctness, efficiency, readability,
                 edge_cases, overall, summary, strengths, improvements, ai_comment
```

---

## 🌐 Deployment

| Service | Purpose | Free Tier |
|---|---|---|
| **Vercel** | Frontend hosting | ✅ Yes |
| **Railway** | Backend server | ✅ Yes |
| **Neon** | PostgreSQL database | ✅ Yes |

---

## 💡 Key Technical Decisions

**Why FastAPI over Flask/Django?**
FastAPI is async-native, has automatic Swagger docs, and Pydantic validation built-in — ideal for a modern API-first project.

**Why async SQLAlchemy?**
AI API calls are I/O bound. Async allows the server to handle other requests while waiting for Groq's response instead of blocking.

**Why Groq over OpenAI?**
Groq offers significantly faster inference and a generous free tier. LLaMA3-70B provides excellent code evaluation comparable to GPT-4.

**Why Demo Mode?**
Recruiters and professors can test the platform instantly without creating an account — better UX for live demonstrations.

---

## 👨‍💻 Author

**Zeeshan** — CSE Data Science  

---

<div align="center">
  <b>⭐ Star this repo if you found it helpful!</b>
</div>

