# IntelliHire — AI-Powered Hiring Intelligence

IntelliHire is a full-stack Next.js 16 application designed to transform the recruitment lifecycle. Moving beyond traditional CRUD applications, IntelliHire provides an intelligent hiring command center with AI resume parsing, candidate scoring, bias detection, tailored interview question generation, and team-collaboration features.

Built specifically for the **House of Edtech Fullstack Developer Assignment**.

## Key Features

- **AI Resume Analysis & Parsing**: Utilizes Google Gemini via the Vercel AI SDK to extract candidates' skills, experience, and education, matching them against job descriptions to produce a comprehensive candidate profile.
- **Explainable Matching Score**: Calculates an overall candidate fit score (0-100) using a weighted average (Skills: 50%, Experience: 35%, Education: 15%), providing lists of matched skills, missing requirements, strengths, and gaps.
- **Bias Detection & Inclusivity Scanner**: Checks job descriptions and evaluations for age, gender, racial, or educational bias, scoring text and offering inclusive alternative phrasings.
- **Interview Question Generator**: Generates 8 tailored questions per candidate (3 technical, 3 behavioral, 2 situational) addressing identified skill gaps.
- **Collaborative Evaluations**: Supports role-based evaluations where hiring team members submit structured ratings (technical, communication, culture fit, experience) and qualitative feedback.
- **Interactive Hiring Pipeline**: Kanban-style staging (Applied → Screening → Interview → Offer → Hired → Rejected) to move candidates through the funnel.
- **AI Streaming Assistant**: A contextual chat interface where recruiters can query their dashboard data (e.g. "Compare candidate X and Y", "Summarize pipeline status").
- **Audit Trails**: Security compliance logging that tracks mutations (CREATE, UPDATE, DELETE) and AI actions.

---

## Technical Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19.2)
- **Language**: TypeScript
- **Database ORM**: Prisma 7 (using PG driver adapters)
- **Database**: PostgreSQL (Neon/Supabase/Local)
- **Authentication**: Auth.js v5 (NextAuth) with Credentials Provider
- **AI Integration**: Vercel AI SDK with Google Gemini (gemini-2.0-flash)
- **Styling**: Tailwind CSS & Vanilla CSS (Curated Dark Theme & Glass-morphism)
- **Icons**: Lucide Icons
- **Validation**: Zod (strict validation on all inputs)

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js v20+
- A running PostgreSQL database instance (Neon, Supabase, Docker, or Local)
- A Gemini API key (Obtainable from [Google AI Studio](https://aistudio.google.com/))

### 2. Install Dependencies
```bash
cd intellihire
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the `intellihire` directory:
```env
# Database Connection String
DATABASE_URL="postgresql://postgres:password@localhost:5432/intellihire?schema=public"

# Auth.js secret keys (Generate one using: openssl rand -base64 32)
AUTH_SECRET="your-32-char-random-secret"
AUTH_TRUST_HOST=true

# Google Gemini API key
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key-here"

# App config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Migrations
Prisma 7 uses a modern driver adapter architecture. Push the schema to your database instance:
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Architecture and Security

### Role-Based Access Control (RBAC)
The application handles four specific roles to match standard hiring operations:
- **Admin**: Full access (user management, all jobs, candidates, evaluations, analytics, and audit logging).
- **Recruiter**: Job creation/management, candidate onboarding, full pipeline stages management, AI tools.
- **Hiring Manager**: Assignee views, candidate screening and pipeline transitions, evaluation submissions.
- **Interviewer**: Access to assigned candidates and job requirements only; can submit and view evaluations.

### Security Mitigations
- **SQL Injection**: Prevented out-of-the-box by Prisma's parameterized queries.
- **XSS & CSRF**: Addressed via React's default property escaping, Auth.js CSRF tokens, and security response headers (X-Frame-Options, X-Content-Type-Options) in the Next.js `proxy.ts`.
- **Rate Limiting**: Custom in-memory rate limiting applied to all heavy API endpoints (including AI analysis, generation, and login routes).
- **Input Validation**: Strict schema verification on all REST payloads using Zod before processing database transitions.

---

## Footer / Submission Details
As requested by the submission guidelines, the following links are featured on the footer:
- **Developer Name**: Samarth Shekhar
- **LinkedIn Profile**: [samarth-shekhar](https://www.linkedin.com/in/samarth-shekhar-185ba311a)
