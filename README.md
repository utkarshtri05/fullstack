# DrawCare - Fullstack Admin Panel ✅

## 🚀 Quick Start (Admin Ready!)

### 1. Supabase Setup (Required)
```
1. https://supabase.com/dashboard → New Project
2. Authentication → Settings → Enable "Email"
3. Settings → API → Copy these:
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   DATABASE_URL=postgresql://postgres:[PASS]@aws-0-us-west...
4. .env.local mein paste karo ↓
```

### 2. Environment (.env.local banao)
```
cp .env.example .env.local
```
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:your-db-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### 3. Database Setup
```
npm run db:push
```

### 4. Admin User (One-time)
```
npx tsx scripts/seed-admin.ts
```
**Admin Login:** utkarsh@gmail.com / utkarsh@12345

### 5. Run App
```
npm run dev
```
**Admin Panel:** http://localhost:3000/admin/login

## 🧪 Test Admin Flow
```
1. Login as admin → /admin dashboard loads
2. Regular user → auto-redirect /dashboard
3. Middleware + RLS protects all admin routes/DB
```

## 📋 TODO (Next Modules)
```
✅ Seeding & Auth (Complete)
⏳ Admin Layout + Dashboard
⏳ User/Subscription/Score Management
⏳ Draw/Prize/Charity CRUD
```

## Stack
- Next.js 15 + TypeScript
- Supabase Auth/DB/RLS
- Drizzle ORM + shadcn/ui + Tailwind
- Stripe-ready subscriptions

**Error Fix:** `.env.local` banao Supabase vars se!

