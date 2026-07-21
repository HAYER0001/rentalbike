# Rental Scope Studio

A universal website-scope configurator for any rental business. Prospect picks their vertical, configures a site while seeing a live preview rebuild in real time, and the scope is emailed to Hayer Technologies.

**Built by Hayer Technologies** — premium web development for real businesses.

---

## Quick start

```bash
npm install    # or pnpm install / yarn
npm run dev    # opens at http://localhost:3000
npm run build  # production build (must pass clean)
```

## Email delivery

### 1. Resend (primary)

```bash
cp .env.example .env.local
# Edit .env.local → paste your Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Get a key at [resend.com/api-keys](https://resend.com/api-keys).  
Verify `hayertechnologies.tech` in Resend dashboard → Domains for inbox delivery.

### 2. FormSubmit fallback (zero-config)

Set `FORM_SUBMIT_FALLBACK=true` in `.env.local`. Works on first deploy with no DNS setup — the app sends via `formsubmit.co/ajax/info@hayertechnologies.tech`.

---

## Editing prices, labels, rewards, features

Everything is in one file:

```
lib/config.ts
```

| What | Where in config.ts |
|---|---|
| Base price (₹18,000) | `BASE_PRICE` |
| Extra item price (₹400/slot) | `EXTRA_ITEM_PRICE` |
| Extra location price (₹1,500) | `EXTRA_LOCATION_PRICE` |
| Business type labels (8 verticals) | `LABEL_MAP` |
| Feature catalogue (10 features) | `FEATURES` |
| Smart defaults per type | `SMART_DEFAULTS` |
| Design tiers (Std / Premium / Signature) | `DESIGN_TIERS` |
| SEO & AEO options | `SEO_AEO_OPTIONS` |
| CareReward ladder | `CARE_REWARD_LADDER` |
| Timeline options | `TIMELINE_OPTIONS` |
| Meeting slots | `MEETING_SLOTS` |
| Preview theme tokens | `PREVIEW_THEME` |
| Template comparison table | `TEMPLATE_COMPARISON` |

All prices in INR. Labels adapt per business type automatically.

---

## Adding a new business type

1. Add the type ID to `BUSINESS_TYPES` array (line ~95)
2. Add its entry to `LABEL_MAP` (line ~123) with all label keys
3. Add `FEATURE_VISIBILITY` per-feature in the `FEATURES` array
4. Optionally add `SMART_DEFAULTS`, `POPULAR_WITH` tags, `PROFIT_FEATURE_HOOK`
5. Add an SVG icon in `components/business-type-picker.tsx` `TypeIcon` switch
6. Add a hero preview variant in `components/live-preview.tsx` hero section

---

## Architecture

```
rental-scope-studio/
├── lib/
│   ├── config.ts       ← Single source of truth (prices, labels, tiers, rewards)
│   ├── store.tsx        ← CartContext + useReducer (all config state + totals)
│   └── utils.ts         ← cn() helper
├── app/
│   ├── layout.tsx       ← Fonts, CSS vars, metadata, grain overlay
│   ├── page.tsx         ← Routes picker ↔ configurator
│   └── api/send-scope/  ← POST endpoint (Resend + FormSubmit fallback)
├── components/
│   ├── business-type-picker.tsx     ← 8 SVG icon tiles
│   ├── configurator-shell.tsx       ← Two-pane layout + mobile sheet
│   ├── controls-panel.tsx           ← 9-step wizard + estimate bar + send actions
│   ├── live-preview.tsx             ← Real rendered mini-site preview
│   ├── debug-panel.tsx              ← ?debug=1 self-test panel
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
├── public/
│   └── favicon.svg
├── tailwind.config.ts  ← Brand palette extended
└── .env.example        ← Env template
```

---

## Debug self-test

Open any configurator page with `?debug=1` to see the self-test panel.  
It runs 8 checks: send button presence, preview rendering, WhatsApp URL, API reachability, mailto fallback, reward threshold, total consistency, and console errors.

---

## Deploy

```bash
# Vercel (recommended)
npm run build
vercel --prod

# Set env vars in Vercel dashboard:
#   RESEND_API_KEY (optional until domain verified)
#   FORM_SUBMIT_FALLBACK=true (use this for first deploy)
```
