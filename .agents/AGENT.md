# Agent instructions — Lost Leads

Read this before making changes. See `ARCH.md` in this same folder for how
the codebase is laid out.

## What this project is

Lost Leads is a follow-up/CRM tool for small businesses (clinics, salons,
agencies, real estate) that auto-creates a follow-up task the moment a lead
comes in, and surfaces anyone not contacted within 24 hours in a "Rescue
Queue."

## Stack

- Next.js (App Router)
- Tailwind CSS v4 (CSS-first config via `@theme`, not `tailwind.config.js`)
- `motion` (the `motion/react` package — formerly Framer Motion) for the
  hero/features entrance animations
- Plain `<img>` / inline SVG for icons — no icon library is installed

## The one rule that matters most here

**All custom Tailwind theme tokens (breakpoints, fonts, animations) must live
in `app/globals.css`, in the `@theme { ... }` block that sits right after
`@import "tailwindcss";`.**

Tailwind v4 only generates utility classes (like `ipad:flex-row` or
`font-switzer`) for `@theme` variables that are visible from the file
containing `@import "tailwindcss"`. A `@theme` block placed in a
component-level CSS file (e.g. `components/originkit/pricing-01.css`) that's
imported via a JS/TSX `import "./foo.css"` statement is **not** picked up —
it silently does nothing, and any utility class depending on it never
compiles. This has caused real bugs before (custom breakpoints not
responding, layouts staying stacked vertically instead of going to a row
layout). If you add a new component that needs a new breakpoint, font, or
animation token, add it to `globals.css`, not a component CSS file.

Current tokens already required in `globals.css`:

```css
@theme {
  /* breakpoints */
  --breakpoint-android-sm: 360px;
  --breakpoint-iphone: 400px;
  --breakpoint-ipad: 768px;
  --breakpoint-ipad-landscape: 1024px;
  --breakpoint-laptop: 1200px;
  --breakpoint-desktop-sm: 1440px;
  --breakpoint-wide-lg: 1440px;

  /* fonts */
  --font-tight: "Instrument Sans", Inter, ui-sans-serif, sans-serif;
  --font-helvetica-neue: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-switzer: "Switzer", Inter, ui-sans-serif, sans-serif;

  /* animation */
  --animate-hero-reveal: hero-reveal 300ms cubic-bezier(0.215, 0.61, 0.355, 1) both;
}

@keyframes hero-reveal {
  from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
```

If a new section is added that needs its own breakpoint/font/animation,
append to this same block rather than creating a parallel one elsewhere.

## Section components ("OriginKit" pattern)

Homepage sections live in `components/originkit/*.tsx`, one file per section,
each with a matching `.css` file for section-scoped styles (keyframes,
`@font-face`, non-theme CSS) that ARE safe to keep component-local — only
`@theme` blocks need to move to `globals.css`, plain CSS does not.

Shared sub-components for a given section live under
`components/originkit/ui/<section-name>/`.

`app/page.tsx` composes sections in order:

```
Hero01 → Features01 → FeaturesWhy (features-04) → Pricing01
```

## Content and assets

- Copy, pricing, and feature lists are hardcoded as data arrays/objects at
  the top of each section component — no CMS. Edit in place.
- Real business claims (customer counts, uptime %, promos) should only ever
  reflect things actually true of the business — several placeholder stats
  from the original design templates were deliberately replaced with
  real/neutral copy already. Don't reintroduce fabricated numbers.
- Some images referenced by these sections don't exist as real photography —
  they're generated placeholders (e.g. `public/originkit/features-04/*.png`
  are simple isometric-shape renders, not real product screenshots; avatar
  and logo images are generated inline SVG data URIs). Swap these for real
  assets when available; search for `asset(` and `data:image/svg+xml` to find
  them.

## Before committing

- Run a build (`next build`) — Tailwind v4 errors from missing `@theme`
  tokens won't always show up in dev mode the same way.
- If you add/remove a breakpoint or font token, grep the component files for
  its usage (e.g. `grep -rn "desktop-sm:" components/`) to make sure nothing
  is left dangling.
