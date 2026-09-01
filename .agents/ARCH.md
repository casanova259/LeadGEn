# Architecture — Lost Leads

## Folder structure

```
app/
  page.tsx                 → homepage, composes all sections
  globals.css               → Tailwind entry; ALL @theme tokens live here (see AGENT.md)

components/
  originkit/
    hero-01.tsx              → hero section wrapper (imports CSS, renders content)
    hero-01.css               → hero keyframes/local styles
    features-01.tsx           → tabbed feature showcase w/ live preview panel
    features-01.css
    features-04.tsx           → "Why Lost Leads" 5-tile band (FeaturesWhy export)
    features-04.css
    pricing-01.tsx             → pricing cards w/ monthly/yearly toggle
    pricing-01.css
    process-01.css             → shared entrance-animation keyframes (imported
                                  by features-01)
    breakpoints.css            → legacy/reference copy of breakpoint tokens —
                                  NOT actually wired into the Tailwind build;
                                  the real source of truth is globals.css
    ui/
      hero-01/
        hero-01-content.tsx    → all hero markup, nav, CTAs, browser preview mock
        spotlight-reveal.tsx   → word-by-word text reveal animation, generic/reusable
        trusted-by.tsx         → logo strip, generic/reusable (takes logos as props)
      features-04/
        cards.tsx               → Plate / FeatureCard / WideCard building blocks
        ascii-art.tsx            → wraps an image in the ASCII-reveal canvas effect
        ascii-reveal.tsx         → canvas-based image→ASCII renderer (generic)
        corner-blocks.tsx        → decorative corner marks (generic)
        edge-dot-bands.tsx       → decorative dot border (generic)
        grid-pattern.tsx         → decorative background grid lines (generic)
      pricing-01/
        billing-toggle.tsx       → monthly/yearly switch + useBillingCycle hook

public/
  originkit/
    features-04/
      focus.png, connect.png, scale.png   → generated isometric-shape source
                                             images for the ASCII-art effect
                                             (placeholders — see AGENT.md)

.agents/
  AGENT.md      → agent-facing instructions (read this first)
  ARCH.md       → this file
```

## Page composition

`app/page.tsx`:

```tsx
<Hero01 />        {/* nav, headline, CTAs, Rescue Queue browser mockup, trusted-by strip */}
<Features01 />    {/* tabbed feature explorer: Rescue Queue / Auto tasks / Lead list / Analytics */}
<FeaturesWhy />    {/* 5-tile "Why Lost Leads" band: Focus / Connect / Scale + 2 stat plates */}
<Pricing01 />       {/* Starter / Growth / Scale pricing cards, monthly-yearly toggle */}
```

Each section is a self-contained `"use client"` component. There's no shared
layout/header/footer component yet — the hero's own nav bar (in
`hero-01-content.tsx`) currently serves as the page header, and there is no
footer section built yet.

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
