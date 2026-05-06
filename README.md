# SHIRE

SHIRE is a hospitality hiring platform built for the F&B and hospitality industry.  
It connects workers looking for jobs with hotels, restaurants, cafes, and venues looking to hire staff.

The platform supports:
- Full-time hiring
- Part-time hiring
- Gig/shift-based staffing

---

# 🚀 Features

## 👷 Worker Features
- User authentication
- Worker profile creation
- Browse hospitality jobs
- Apply to jobs
- Track application status
- View applied jobs in dashboard

## 🏢 Employer Features
- Employer authentication
- Company/job management
- Post hospitality jobs
- View applicants
- Track hiring activity through dashboard

## 🔐 Authentication
- Supabase Authentication
- Email/password login & signup
- Role-based access control
- Protected routes

---

# 🛠 Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Backend
- Supabase
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)

---

# 📂 Project Structure

```bash
src/
│
├── app/
│   ├── dashboard/
│   ├── jobs/
│   ├── login/
│   ├── post-job/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│
├── contexts/
│
├── lib/
│   └── supabase.ts
│
└── styles/
