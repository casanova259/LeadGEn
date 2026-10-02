> **Note**: For the complete, authoritative system documentation covering all data models, server actions, webhooks, and workflows, see [PROJECT_DOCUMENTATION.md](file:///p:/lost-leads/lost-leads/PROJECT_DOCUMENTATION.md).

## High-Level System Structure

```
app/
  page.tsx                     → Marketing landing page (OriginKit sections)
  globals.css                  → Tailwind v4 entry; ALL @theme tokens live here
  layout.tsx                   → Root layout with ClerkProvider
  (app)/                       → Authenticated CRM workspace
    layout.tsx                 → App shell (Sidebar, Header, Breadcrumbs)
    dashboard/page.tsx         → Command center (Rescue Queue, KPI cards, Flow Chart)
    kanbanleads/page.tsx       → ReUI @dnd-kit multi-column Kanban board
    leads/page.tsx             → Full leads table with search, filters, import/export
    leads/[id]/page.tsx        → Lead 360 detail, multi-category notes, task list
    tasks/page.tsx             → Task center (Overdue, Today, Completed)
    settings/page.tsx          → Webhook endpoints, API keys, business settings
  api/
    webhook/lead/route.ts      → Inbound generic lead webhook (JSON/Form-Data)
    webhook/whatsapp/route.ts  → Meta WhatsApp Cloud API webhook
    cron/digest/route.ts       → Vercel cron morning email digest
    leads/export/route.ts      → CSV lead export endpoint

components/
  dashboard/                   → CRM Action Center, Dispatch Chart, Status Rail, KPIs
  leads/                       → Lead list, import dialog, note composer, Kanban
    kanban/                    → ReUI @dnd-kit kanban-board.tsx, kanban-card.tsx
  tasks/                       → Task list view, create dialog, task row
  shared/                      → Sidebar, navbar, breadcrumbs, onboarding checklist
  ui/                          → Base UI primitives (button, card, dialog, etc.)
  originkit/                   → Marketing landing page components (Hero, Features, Pricing)

src/
  components/reui/             → ReUI Kanban and badge primitives
  server/
    actions/                   → Server Actions (lead.actions, task.action, setting.actions)
    services/                  → Business logic (lead.service, task.service, business, email)

prisma/
  schema.prisma                → Database models (Business, Lead, Task, Activity)
```

## Landing Page Composition (`app/page.tsx`)

```tsx
<Hero01 />        {/* nav, headline, CTAs, Rescue Queue browser mockup, trusted-by strip */}
<Features01 />    {/* tabbed feature explorer: Rescue Queue / Auto tasks / Lead list / Analytics */}
<FeaturesWhy />   {/* 5-tile "Why Lost Leads" band: Focus / Connect / Scale + 2 stat plates */}
<Pricing01 />     {/* Starter / Growth / Scale pricing cards, monthly-yearly toggle */}
<Footer />        {/* Product navigation footer */}
```

## Where content lives

| What | File | Notes |
|---|---|---|
| Hero headline/subtext/CTAs | `hero-01-content.tsx` | plain JSX strings |
| Trusted-by customer names | `hero-01-content.tsx` → `TRUSTED_NAMES` | rendered as generated text-wordmark SVGs, not real logos |
| Feature tabs (Rescue/Tasks/Leads/Analytics) | `features-01.tsx` → `FEATURES` array | each has an inline mockup component, not a screenshot |
| "Why" tiles (Focus/Connect/Scale) + 2 stat plates | `features-04.tsx` → `FEATURES` object + JSX | avatar/icon assets generated inline |
| Pricing plans, features, prices | `pricing-01.tsx` → `PRICING_PLANS` array | yearly prices are a "2 months free" placeholder — confirm real numbers before launch |

## Known placeholders to eventually replace

- `public/originkit/features-04/{focus,connect,scale}.png` — generated
  isometric-cube art standing in for real product/brand imagery.
- Avatar circles and trusted-by logos in `hero-01-content.tsx` and
  `features-04.tsx` — generated initials/text SVGs, not real customer photos
  or logos.
- `pricing-01.tsx` yearly prices (`yearlyPrice` field per plan) — currently
  monthly × 10 (i.e. "2 months free"), not a confirmed business decision.
- Plan/benefit icons in `pricing-01.tsx` (Starter/Growth/Scale icons, check,
  calendar, card, database) — simple inline SVGs, fine as permanent icons but
  not from any icon library, so they won't auto-update if you later adopt one
  (e.g. lucide-react).

## Fonts referenced but not self-hosted

`process-01.css` / `pricing-01.css` reference `@font-face` files
(`clash-grotesk.ttf`, `switzer.ttf`) under `/public/originkit/...` that don't
exist in this repo. They fail silently (404 → browser falls back to the
`ui-sans-serif` stack defined alongside them in `globals.css`). Add the real
font files under the referenced paths if/when you have licenses for them.
