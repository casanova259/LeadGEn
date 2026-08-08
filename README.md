# Lost Leads

A lightweight CRM that helps small businesses stop losing customers by ensuring every lead is tracked, followed up, and never forgotten.

> Businesses lose customers because they forget to follow up. Lost Leads makes sure that never happens.

## Who it's for

Clinics, coaching institutes, gyms, salons, local agencies, real estate brokers, and other small businesses that get leads from website forms, WhatsApp, phone calls, walk-ins, and social ads — and currently track them in spreadsheets or chat threads.

## Features

- **Centralized lead inbox** — every lead in one place, regardless of source
- **Auto follow-up tasks** — a task is created automatically whenever a new lead comes in
- **🔥 Rescue Queue** — surfaces hot leads that have gone 24+ hours without contact
- **Dashboard analytics** — leads by source, status distribution, conversion rate
- **Daily email digest** — a summary of hot leads, pending follow-ups, and overdue tasks
- **Business settings** — manage business profile (name, industry, timezone)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Route Handlers, Server Actions |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Auth | Clerk |
| Email | Resend |
| Charts | Recharts |
| Deployment | Vercel |

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create a `.env` file:
```env
DATABASE_URL=postgresql://...          # Supabase session/transaction pooler
DIRECT_URL=postgresql://...            # Supabase direct connection (for migrations)

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

RESEND_API_KEY=re_...
CRON_SECRET=your-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run database migrations
```bash
npx prisma migrate dev
```

### 4. Start the dev server
```bash
npm run dev
```

Visit `http://localhost:3000`.

## Project Structure

```
app/
  (app)/            # Authenticated routes (shared sidebar/navbar layout)
    dashboard/
    leads/
    tasks/
    settings/
  api/
    cron/digest/    # Daily email digest cron endpoint
components/
  shared/           # App-specific components (sidebar, navbar, form-select, charts)
  ui/               # shadcn/ui primitives
server/
  actions/          # Server actions (mutations called from forms)
  services/         # Business logic, database queries
lib/
  prisma.ts         # Prisma client singleton
prisma/
  schema.prisma     # Database schema
```

## Deployment

Deployed on Vercel. The daily digest email is triggered via a Vercel Cron Job defined in `vercel.json`, calling `/api/cron/digest` once a day.

Make sure all environment variables above are also set in the Vercel project settings, and that your Clerk instance allows the production domain.

## Roadmap

- [ ] WhatsApp integration
- [ ] Website form webhooks
- [ ] AI follow-up suggestions
- [ ] Team members and role-based access
- [ ] Calendar integration
- [ ] Mobile app