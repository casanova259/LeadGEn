# Lost Leads — Master Project Documentation

> **Complete system architecture, technical specifications, database schema, API reference, component hierarchy, and operational guide for the Lost Leads CRM platform.**

---

## Table of Contents

1. [Executive Overview & Core Mission](#1-executive-overview--core-mission)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture & Multi-Tenancy](#3-system-architecture--multi-tenancy)
4. [Database Schema & Data Model](#4-database-schema--data-model)
5. [Core Features & Business Workflows](#5-core-features--business-workflows)
   - [Automated Task Scheduling](#automated-task-scheduling)
   - [The Rescue Queue Engine](#the-rescue-queue-engine)
   - [ReUI `@dnd-kit` Kanban Board (`/kanbanleads`)](#reui-dnd-kit-kanban-board-kanbanleads)
   - [CRM Command Dashboard (`/dashboard`)](#crm-command-dashboard-dashboard)
   - [Lead Management & Batch Import (`/leads`)](#lead-management--batch-import-leads)
   - [Lead 360 Detail View & Notes Engine (`/leads/[id]`)](#lead-360-detail-view--notes-engine-leadsid)
   - [Task Management Center (`/tasks`)](#task-management-center-tasks)
   - [Inbound Webhooks & WhatsApp Ingestion](#inbound-webhooks--whatsapp-ingestion)
   - [Automated Daily Email Digest](#automated-daily-email-digest)
   - [Marketing & Landing Page Engine (`/`)](#marketing--landing-page-engine-)
6. [Complete Directory Structure](#6-complete-directory-structure)
7. [API & Server Actions Reference](#7-api--server-actions-reference)
   - [Server Actions (`src/server/actions/`)](#server-actions)
   - [REST & Webhook Endpoints (`app/api/`)](#rest--webhook-endpoints)
8. [Design System & Styling Rules (Tailwind CSS v4)](#8-design-system--styling-rules-tailwind-css-v4)
9. [Environment Variables & Configuration](#9-environment-variables--configuration)
10. [Local Development & Deployment Guide](#10-local-development--deployment-guide)

---

## 1. Executive Overview & Core Mission

### The Problem
Small service businesses (dental clinics, medical practices, salons, coaching institutes, real estate agencies, and home contractors) spend significant budgets acquiring leads through website forms, Meta/Google ads, and WhatsApp. However, **over 60% of leads go cold because staff fail to follow up within the first 24 hours**. Spreadsheets and chat threads lack proactive accountability, leading to missed revenue and forgotten opportunities.

### The Solution: Lost Leads
**Lost Leads** is an ultra-focused, opinionated CRM platform built to eliminate lead decay:
- **Instant Accountability**: The exact millisecond a lead arrives, a follow-up task is auto-scheduled with a strict 24-hour SLA.
- **The Rescue Queue**: A dedicated radar that flags any lead untouched after 24 hours, surfacing them in high-contrast urgency badges for instant outreach via WhatsApp or phone.
- **Fluid Drag-and-Drop Pipeline**: A modern ReUI `@dnd-kit` Kanban board featuring touch gestures, keyboard accessibility, optimistic updates, and one-tap communication.
- **Zero Friction Ingestion**: Ingests leads seamlessly via open webhooks (JSON / multipart form-data) and direct Meta WhatsApp Cloud API webhooks.
- **Executive Daily Digest**: Automated morning emails summarizing hot leads, pending outreach, and overdue tasks via Resend and cron.

---

## 2. Technology Stack

| Layer | Technology | Details / Rationale |
|---|---|---|
| **Framework** | **Next.js 16.2.10** | App Router, React Server Components (RSC), Turbopack, Server Actions |
| **Frontend Runtime** | **React 19.2.4** | Latest React features, concurrent rendering, Actions |
| **Styling** | **Tailwind CSS v4** | CSS-first configuration using `@theme` in `app/globals.css` |
| **Component Libraries** | **shadcn/ui + ReUI** | Radix UI primitives (`radix-ui`), custom styled accessible components |
| **Drag & Drop** | **@dnd-kit** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for Kanban |
| **Data Visualizations** | **Recharts 3.8.0** | Interactive area charts, dispatch trends, pipeline flow analytics |
| **Animations** | **Motion 13.1.1** | `motion/react` for hero animations, transitions, and reveals |
| **Authentication** | **Clerk (@clerk/nextjs 7.5.20)** | Multi-tenant auth, session validation, route protection middleware |
| **Database** | **PostgreSQL (Supabase)** | Cloud Postgres with connection pooling (`DATABASE_URL`) & direct (`DIRECT_URL`) |
| **ORM** | **Prisma 6.19.3** | Type-safe queries, relational schema migrations, connection pooling |
| **Email Service** | **Resend 6.18.1** | Transactional daily digest dispatches with formatted HTML templates |
| **Icons** | **Lucide React 1.26.0** | Clean, consistent SVG icon set across all UI surfaces |

---

## 3. System Architecture & Multi-Tenancy

```mermaid
flowchart TD
    subgraph Inbound Channels
        A1[Website Form Webhook] --> W1["/api/webhook/lead"]
        A2[Meta WhatsApp Webhook] --> W2["/api/webhook/whatsapp"]
        A3[CSV Batch Import] --> SA1["importLeadsAction()"]
        A4[Manual Quick Add] --> SA2["createLeadAction()"]
    end

    subgraph Authentication & Business Context
        CLERK[Clerk Auth / Middleware] --> GETBI["getOrCreateBusiness()"]
    end

    subgraph Application Core [src/server/services/]
        W1 & W2 & SA1 & SA2 --> LS["lead.service.ts"]
        LS --> BS["business.service.ts"]
        LS --> TS["task.service.ts"]
        TS --> ES["email.service.ts"]
    end

    subgraph Database Layer [Prisma / PostgreSQL]
        DB_B[(businesses)]
        DB_L[(leads)]
        DB_T[(tasks)]
        DB_A[(activities)]
        LS --> DB_L
        LS --> DB_A
        TS --> DB_T
        BS --> DB_B
    end

    subgraph User Experience [Next.js App Router]
        DASH["/dashboard<br/>(Rescue Queue, KPIs, Flow Chart)"]
        KANBAN["/kanbanleads<br/>(@dnd-kit Interactive Pipeline)"]
        LEADS["/leads & /leads/[id]<br/>(Search, Filter, Notes, Timeline)"]
        TASKS["/tasks<br/>(Overdue, Today, Completed)"]
    end

    DB_L & DB_T & DB_A --> DASH & KANBAN & LEADS & TASKS
    CRON["Vercel Cron (/api/cron/digest)"] --> ES --> RESEND[Resend API] --> USER_EMAIL[Business Owner Email]
```

### Multi-Tenancy Architecture
- Every authenticated user session is verified via `@clerk/nextjs`.
- The helper `getOrCreateBusiness()` maps the Clerk `ownerId` to a record in the `businesses` table.
- If a business profile does not exist yet (e.g. first login), one is automatically created with default timezone and business naming.
- All lead queries, task creations, and mutations enforce strict tenancy isolation: `{ businessId: business.id }`.

---

## 4. Database Schema & Data Model

The database is defined in `prisma/schema.prisma` and backed by PostgreSQL:

```prisma
model Business {
  id        String   @id @default(cuid())
  ownerId   String   @unique
  name      String
  industry  String?
  timezone  String   @default("UTC")
  createdAt DateTime @default(now())
  leads     Lead[]

  @@map("businesses")
}

model Lead {
  id          String       @id @default(cuid())
  businessId  String
  name        String
  phone       String?
  email       String?
  source      LeadSource
  status      LeadStatus   @default(NEW)
  priority    LeadPriority @default(NORMAL)
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  contactedAt DateTime?
  activities  Activity[]
  business    Business     @relation(fields: [businessId], references: [id], onDelete: Cascade)
  tasks       Task[]

  @@index([businessId])
  @@index([businessId, status])
  @@index([businessId, priority, status, createdAt])
  @@map("leads")
}

model Task {
  id          String     @id @default(cuid())
  leadId      String
  type        TaskType
  dueAt       DateTime
  status      TaskStatus @default(PENDING)
  completedAt DateTime?
  lead        Lead       @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@index([status, dueAt])
  @@map("tasks")
}

model Activity {
  id        String       @id @default(cuid())
  leadId    String
  type      ActivityType
  metadata  Json?
  createdAt DateTime     @default(now())
  lead      Lead         @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@map("activities")
}
```

### Enumerations
- **`LeadSource`**: `WEBSITE`, `WHATSAPP`, `PHONE`, `WALK_IN`, `FACEBOOK_ADS`, `INSTAGRAM_ADS`, `GOOGLE_ADS`, `OTHER`.
- **`LeadStatus`**: `NEW`, `CONTACTED`, `FOLLOW_UP`, `QUALIFIED`, `CONVERTED`, `LOST`.
- **`LeadPriority`**: `NORMAL`, `HOT`.
- **`TaskType`**: `FOLLOW_UP`, `CALL`, `EMAIL`.
- **`TaskStatus`**: `PENDING`, `COMPLETED`, `OVERDUE`.
- **`ActivityType`**: `LEAD_CREATED`, `STATUS_CHANGED`, `TASK_COMPLETED`, `LEAD_UPDATED`, `LEAD_CONVERTED`.

---

## 5. Core Features & Business Workflows

### Automated Task Scheduling
- When a lead is registered via `createLead()` or batch-imported:
  1. A `Lead` record is inserted with `status = NEW`.
  2. An `Activity` record (`LEAD_CREATED`) is logged.
  3. A `Task` is immediately created:
     ```ts
     dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Exactly 24 hours out
     type: "FOLLOW_UP",
     status: "PENDING"
     ```
  4. This guarantees that every lead enters the system with an active countdown.

### The Rescue Queue Engine
The **Rescue Queue** is Lost Leads' primary differentiator:
- **Definition**: Any lead where:
  - `status == "NEW"`
  - `priority == "HOT"`
  - `createdAt < (now - 24 hours)` (uncontacted for over 24 hours)
- **Surfacing**:
  - Pinned prominently on `/dashboard` in the **CrmActionCenter** spotlight.
  - Highlighted with flame badges and flashing rescue counts.
  - Direct 1-click **WhatsApp chat** and **Phone call** buttons that immediately prompt outreach and mark the lead as `CONTACTED`.

### ReUI `@dnd-kit` Kanban Board (`/kanbanleads`)
Located at `app/(app)/kanbanleads/page.tsx`:
- **Modern Drag & Drop**: Uses ReUI primitives built on top of `@dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`).
- **Columns**: Fixed stage pipeline:
  1. **New Leads** (`NEW`)
  2. **Followed Up** (`CONTACTED`, `FOLLOW_UP`, `QUALIFIED`)
  3. **Converted** (`CONVERTED`)
- **Key Capabilities**:
  - **Optimistic Updates**: Dropping a card instantly moves it visually; persists via `updateLeadAction` in the background with rollback if rejected.
  - **Animated Overlays**: Ghost drag preview tilts slightly and floats under the cursor during drag.
  - **Touch & Accessibility**: Native mobile touch drag (long-press) and full keyboard accessibility (Tab + Space + Arrow keys).
  - **Lead Card Quick Actions**: WhatsApp icon button, Phone call icon button, HOT flame badge, dropdown menu for stage changes, and Discard option with 6-second undo toast.
  - **Quick Add**: Inline form at the foot of each column to quickly inject leads into that specific stage.

### CRM Command Dashboard (`/dashboard`)
The command hub for daily operations (`app/(app)/dashboard/page.tsx`):
1. **CrmHeader**: Personalized business greeting, live date, quick actions (New Lead dialog, Import CSV), and active alert counts.
2. **Onboarding Checklist**: Displays for new businesses with 0 leads to guide them through creating their first lead, copying their webhook, or importing contacts.
3. **Status Rail**: High-density 3-pillar metrics bar displaying Total Leads, Today's Inbound, Rescue Queue count, and Conversion Rate.
4. **Dispatch Flow Chart (`DispatchChart`)**: Recharts-powered gradient area chart illustrating daily lead intake trends over the last 14 days with plain-language trend analysis.
5. **CRM Action Center (`CrmActionCenter`)**:
   - Left side: **Rescue Queue Spotlight** with quick-contact actions for at-risk leads.
   - Right side: **Outreach Velocity** showing tasks due today and completion progress bar.
6. **Recent Inbound Opportunities Table**: Fast table of the latest leads with source badges, priority tags, and status changers.

### Lead Management & Batch Import (`/leads`)
Located at `app/(app)/leads/page.tsx`:
- **Search & Filtering**: Real-time filtering by status (`NEW`, `CONTACTED`, etc.), priority (`HOT`, `NORMAL`), and search string.
- **CSV Batch Import Dialog**:
  - Modal supporting paste or file upload of CSV data (`name`, `phone`, `email`, `source`, `priority`, `notes`).
  - Toggle to auto-generate 24-hour follow-up tasks for all imported leads.
- **CSV Export Endpoint**: Direct export via `/api/leads/export` generating an RFC-4180 compliant CSV file download.
- **Quick Row Actions**: Mark contacted, change status, open lead profile, or delete.

### Lead 360 Detail View & Notes Engine (`/leads/[id]`)
Located at `app/(app)/leads/[id]/page.tsx`:
- **Identity & Contact**: Name, direct phone dialing, WhatsApp web launching, email, and source channel.
- **Status & Priority Controls**: Fast toggles to update stage or mark as HOT.
- **Multi-Category Note Composer**:
  - Log interactions under categories: `CALL`, `VOICEMAIL`, `MEETING`, or `GENERAL`.
  - Option to simultaneously schedule a future follow-up task with date/time picker.
- **Activity Stream**: Reverse-chronological audit log tracking lead creation, status changes, notes, task completions, and conversions.
- **Task Checklist**: View and complete pending tasks tied to this lead.

### Task Management Center (`/tasks`)
Located at `app/(app)/tasks/page.tsx`:
- Filter tasks by status: **Overdue**, **Today**, **Upcoming**, and **Completed**.
- Filter by task type: Follow-Up, Phone Call, Email.
- One-click task completion triggering activity logging and badge updates.
- Create Task modal for custom reminders with due dates.

### Inbound Webhooks & WhatsApp Ingestion
1. **Generic Webhook (`/api/webhook/lead`)**:
   - Accepts `POST` requests formatted as JSON or `multipart/form-data`.
   - Identification via URL parameter `?businessId=...` or header `x-business-id: ...`.
   - Full CORS support (`OPTIONS` preflight).
   - Intelligently maps fields: `name`, `full_name`, `phone`, `mobile`, `email`, `source`, `notes`.
   - Automatically marks ad leads (`FACEBOOK_ADS`, `INSTAGRAM_ADS`, `GOOGLE_ADS`) as `HOT` priority.
2. **WhatsApp Cloud API Webhook (`/api/webhook/whatsapp`)**:
   - `GET`: Handles Meta webhook challenge verification (`hub.challenge` and `hub.verify_token`).
   - `POST`: Ingests incoming WhatsApp messages from Meta Graph API or third-party webhooks, extracting contact names, phone numbers, and message bodies.

### Automated Daily Email Digest
Located at `app/api/cron/digest/route.ts` and `src/server/services/email.service.ts`:
- **Trigger**: Protected `GET` route secured by `Authorization: Bearer ${CRON_SECRET}`, executed daily by Vercel Cron.
- **Execution**: Iterates through all registered businesses:
  - Fetches hot leads, uncontacted leads, tasks due today, and overdue tasks.
  - Sends a beautifully styled HTML digest to the business owner via the Resend API.

### Marketing & Landing Page Engine (`/`)
Located at `app/page.tsx`:
- **Hero01**: Dynamic navigation, spotlight headline text reveal, interactive browser mock showcasing the Rescue Queue, and trusted-by brand strip.
- **Features01**: Tabbed feature explorer with live preview simulations (Rescue Queue, Auto Tasks, Lead Pipeline, Real-Time Analytics).
- **FeaturesWhy**: 5-tile responsive band with ASCII art rendering (`ascii-reveal.tsx`) focusing on Focus, Connect, and Scale.
- **Product Deep Dive**: Detailed breakdown of the 24-hour lead decay problem.
- **Pricing01**: Starter, Growth, and Scale plans with an interactive monthly/yearly billing toggle.
- **FAQ & Footer**: Accordion FAQ section and complete product navigation footer.

---

## 6. Complete Directory Structure

```
lost-leads/
├── .agents/                      # AI Agent guidelines & architecture context
│   ├── AGENT.md                  # Design tokens, Tailwind v4 rules, commit checklist
│   └── ARCH.md                   # High-level architecture documentation
├── app/                          # Next.js 16 App Router
│   ├── (app)/                    # Authenticated workspace layout
│   │   ├── layout.tsx            # App shell with Sidebar, Header, Breadcrumbs
│   │   ├── dashboard/            # /dashboard command center
│   │   ├── kanbanleads/          # /kanbanleads ReUI @dnd-kit Kanban board
│   │   ├── leads/                # /leads list, /leads/new, /leads/[id] 360 detail
│   │   ├── tasks/                # /tasks task manager
│   │   └── settings/             # /settings webhook keys & business profile
│   ├── api/                      # Route handlers
│   │   ├── cron/digest/          # Daily email digest cron endpoint
│   │   ├── leads/                # Inbound API & /export CSV download
│   │   └── webhook/              # /webhook/lead and /webhook/whatsapp
│   ├── sign-in/ & sign-up/       # Clerk authentication pages
│   ├── globals.css               # Tailwind CSS v4 entry & @theme definition
│   ├── layout.tsx                # Root HTML/Clerk Provider layout
│   └── page.tsx                  # Public marketing landing page
├── components/                   # React UI Components
│   ├── dashboard/                # CRM action center, status rail, dispatch chart, KPIs
│   ├── leads/                    # Lead lists, import modal, notes composer, Kanban
│   │   └── kanban/               # kanban-board.tsx, kanban-card.tsx
│   ├── originkit/                # Landing page sections (Hero, Features, Pricing)
│   ├── shared/                   # Cross-cutting components (Sidebar, Navbar, Badges)
│   ├── tasks/                    # Task list views, row items, create modals
│   └── ui/                       # shadcn/ui primitives (button, card, dialog, etc.)
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Core models (Business, Lead, Task, Activity)
│   └── migrations/               # PostgreSQL migration history
├── src/                          # Server services and reusable ReUI extensions
│   ├── components/reui/          # ReUI Kanban (@dnd-kit primitives) & Badge
│   └── server/
│       ├── actions/              # Server Actions (lead.actions, task.action, setting)
│       └── services/             # lead.service, task.service, business, email
├── lib/
│   └── prisma.ts                 # Prisma Client singleton
├── middleware.ts                 # Clerk route protection & auth redirection
├── package.json                  # Dependencies & scripts
└── PROJECT_DOCUMENTATION.md      # This master document
```

---

## 7. API & Server Actions Reference

### Server Actions

#### `src/server/actions/lead.actions.ts`
- **`createLeadAction(input)`**: Validates business session, creates lead, logs `LEAD_CREATED`, schedules 24h follow-up task, revalidates paths (`/leads`, `/dashboard`, `/tasks`).
- **`updateLeadAction(id, input)`**: Updates lead fields (status, priority, notes, etc.), logs `STATUS_CHANGED` or `LEAD_UPDATED`, revalidates paths.
- **`markContactedAction(id)`**: Sets `status = "CONTACTED"` and `contactedAt = new Date()`.
- **`deleteLeadAction(id)`**: Removes lead and cascades deletion to tasks/activities; redirects to `/leads`.
- **`addLeadNoteAction(leadId, input)`**: Appends a categorized note to the activity log; optionally schedules an associated follow-up task.
- **`importLeadsAction(leads, autoCreateTasks)`**: Batch-inserts multiple leads with error-resilient iteration; generates 24h tasks if requested.

#### `src/server/actions/task.action.ts`
- **`completeTaskAction(id)`**: Marks task `COMPLETED` and sets `completedAt`.
- **`createTaskAction(input)`**: Creates an explicit task (`FOLLOW_UP`, `CALL`, `EMAIL`) with custom due date.
- **`rescheduleTaskAction(id, newDueAt)`**: Reschedules task and resets status to `PENDING`.
- **`deleteTaskAction(id)`**: Deletes a task.

#### `src/server/actions/setting.actions.ts`
- **`updateBusinessSettingsAction(input)`**: Updates company name, industry, and timezone.

---

### REST & Webhook Endpoints

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/webhook/lead` | `POST` | None (Public / BusinessID param) | Ingests new leads from website forms, external landing pages, or Zapier. Accepts JSON or Form-Data. |
| `/api/webhook/whatsapp` | `GET` | Meta Verify Token | Meta WhatsApp Cloud API webhook challenge verification. |
| `/api/webhook/whatsapp` | `POST` | None (Payload-based) | Ingests incoming WhatsApp chat messages, auto-creating a new lead or logging message. |
| `/api/cron/digest` | `GET` | Bearer Token (`CRON_SECRET`) | Dispatches morning email digests to all business owners via Resend. |
| `/api/leads/export` | `GET` | Authenticated (Clerk) | Streams an RFC-4180 CSV file containing all leads for the current business. |

#### Webhook Ingestion Payload Example (`POST /api/webhook/lead`)
```json
{
  "businessId": "cuid_business_123",
  "name": "Sarah Connor",
  "phone": "+1 555-0199",
  "email": "sarah@cyberdyne.io",
  "source": "WEBSITE",
  "priority": "HOT",
  "notes": "Requested pricing on full clinic package"
}
```

---

## 8. Design System & Styling Rules (Tailwind CSS v4)

### The Critical Tailwind v4 Rule
> **CRITICAL**: Tailwind CSS v4 eliminates `tailwind.config.js`. All custom theme tokens (breakpoints, fonts, custom animations) **must reside in `app/globals.css`** within the `@theme` directive directly following `@import "tailwindcss";`.
> Component-level CSS `@theme` declarations are ignored by the compiler and will cause layout classes to fail silently.

### Active Theme Tokens in `app/globals.css`
```css
@import "tailwindcss";

@theme {
  /* Breakpoint Tokens */
  --breakpoint-android-sm: 360px;
  --breakpoint-iphone: 400px;
  --breakpoint-ipad: 768px;
  --breakpoint-ipad-landscape: 1024px;
  --breakpoint-laptop: 1200px;
  --breakpoint-desktop-sm: 1440px;
  --breakpoint-wide-lg: 1440px;

  /* Typography */
  --font-tight: "Instrument Sans", Inter, ui-sans-serif, sans-serif;
  --font-helvetica-neue: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-switzer: "Switzer", Inter, ui-sans-serif, sans-serif;

  /* Animations */
  --animate-hero-reveal: hero-reveal 300ms cubic-bezier(0.215, 0.61, 0.355, 1) both;
}
```

### Color Variables & Dark Mode
The application uses semantic CSS custom properties:
- Background: `var(--bg)` / `bg-background`
- Foreground/Ink: `var(--ink)` / `text-foreground`
- Cards: `bg-card` / `text-card-foreground` / `ring-foreground/10`
- Accent / Brand: High-contrast primary buttons, fiery orange/red indicators for HOT leads and Rescue Queue urgencies.

---

## 9. Environment Variables & Configuration

Create a `.env` file in the root directory:

```env
# Database Connections (Supabase)
# Transaction pooler URL (port 6543) for application queries
DATABASE_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection URL (port 5432) for migrations
DIRECT_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Email Services (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Lost Leads <notifications@lostleads.app>"

# Scheduled Cron Security
CRON_SECRET="your_secure_random_cron_secret"

# Public App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: WhatsApp Webhook Verify Token
WHATSAPP_VERIFY_TOKEN="lostleads_whatsapp_verify"
```

---

## 10. Local Development & Deployment Guide

### Local Development Setup
1. **Clone & Install Dependencies**:
   ```bash
   git clone <repo-url>
   cd lost-leads
   npm install
   ```
2. **Apply Database Migrations**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
3. **Launch Turbopack Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Verification & Linting
- **Type Checking**:
  ```bash
  npx tsc --noEmit
  ```
- **Linting**:
  ```bash
  npm run lint
  ```
- **Production Build Test**:
  ```bash
  npm run build
  ```

### Production Deployment (Vercel)
1. Link repository to Vercel.
2. In Project Settings > Environment Variables, populate all variables listed in section 9.
3. In `vercel.json`, configure the cron schedule for the daily digest:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/digest",
         "schedule": "0 8 * * *"
       }
     ]
   }
   ```
4. In Clerk Dashboard, ensure your production domain is added to authorized origins and redirect URIs.
