/*
 * ─── RENTAL SCOPE STUDIO ─── /lib/config.ts
 * Single source of truth for every business rule, price, label, tier, and reward.
 * Edit this file to change ANYTHING — the app reads from here.
 *
 * Architecture:
 *   1. Core constants (owner, site, currency)
 *   2. Base package (₹18,000 — the foundation every build ships with)
 *   3. Scale pricing (extra inventory items, extra locations)
 *   4. Business type IDs + label map (one codebase serves every rental vertical)
 *   5. Persuasion constants (smart defaults, popular-with tags, micro-lines)
 *   6. Feature catalogue (one-time add-on features, per-type labels & visibility)
 *   7. Design tiers (Standard / Premium Motion / Signature 3D)
 *   8. SEO & AEO options (one-time, default OFF — the ₹40k hook)
 *   9. Extra services (logo, photography, video, social)
 *  10. CareReward loyalty ladder (maintenance + SEO free at thresholds)
 *  11. Timeline options (Standard 3-4 wks / Fast-track +15%)
 *  12. Meeting slots (weekday/weekend × morning/afternoon/evening)
 *  13. Ghost effect timing for the live preview
 *  14. Brand customization ("Make it yours") + live preview theme resolver
 *  15. Helpers
 */

// ───── 1. CORE ─────

/** Studio contact — scope proposals are emailed here */
export const OWNER_EMAIL = "info@hayertechnologies.tech";

/** WhatsApp number for follow-up (no + prefix, digits only) */
export const OWNER_WHATSAPP = "917877514132";

/** Base currency symbol */
export const CURRENCY = "₹";

/** Default proposal subject line */
export const PROPOSAL_SUBJECT = "Your Rental Website Scope — Rental Scope Studio";

/**
 * Email delivery config.
 * Resend is the primary provider. Set RESEND_API_KEY in .env.local.
 * FormSubmit (https://formsubmit.co/ajax/) is a zero-config fallback that works
 * on first deploy before the Resend domain is verified — set FORM_SUBMIT_FALLBACK=true
 * to activate it.
 *
 * To verify hayertechnologies.tech for Resend inbox delivery:
 *   1. Add the DKIM/SPF records from Resend dashboard → Domains → hayertechnologies.tech
 *   2. Wait for DNS propagation (5 min–24 hrs)
 *   3. Click "Verify" in Resend dashboard
 *   4. Send a test email from the API route
 */
export const FORM_SUBMIT_URL = "https://formsubmit.co/ajax/info@hayertechnologies.tech";
export const USE_FORM_SUBMIT_FALLBACK = process.env.FORM_SUBMIT_FALLBACK === "true";

// ───── 2. BASE PACKAGE ─────

/**
 * Every project starts at ₹18,000.
 * This is the foundation — responsive site, essential pages, basic inventory,
 * WhatsApp CTA, Google Maps, enquiry form, SSL, deployment.
 */
export const BASE_PRICE = 18000;

/** Bullet list of everything included in the base package */
export const BASE_INCLUDES: string[] = [
  "Responsive design (mobile + desktop)",
  "Home, About, Contact pages",
  "Inventory showcase (up to 8 items)",
  "WhatsApp booking button",
  "Google Maps integration",
  "Enquiry / contact form",
  "SSL certificate",
  "Deploy to your domain",
];

// ───── 3. SCALE PRICING ─────

/**
 * Base includes 8 inventory items. Each item beyond that costs ₹400.
 * Slider: 8–40 on screen → 0–32 extra items charged.
 */
export const EXTRA_ITEM_PRICE = 400;
export const MIN_INVENTORY = 8;
export const MAX_INVENTORY = 40;

/**
 * Base includes 1 pickup/delivery location. Each extra location costs ₹1,500.
 */
export const EXTRA_LOCATION_PRICE = 1500;
export const MIN_LOCATIONS = 1;
export const MAX_LOCATIONS = 10;

// ───── 4. BUSINESS TYPES ─────

/** All supported rental verticals — add new ones here */
export const BUSINESS_TYPES = [
  "bikes",
  "cars",
  "scooters",
  "camping",
  "events",
  "cameras",
  "ebikes",
  "other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

/**
 * Label map — every string the UI shows that varies by vertical lives here.
 * Add a new key for each BusinessType when you add a new vertical.
 */
export interface BusinessTypeLabels {
  items: string;
  itemSingular: string;
  renter: string;
  packageLabel?: string;
  hasChauffeur?: string;
  hasDelivery?: string;
  hasInsurance?: string;
  hasTestRide?: string;
}

export const LABEL_MAP: Record<BusinessType, BusinessTypeLabels> = {
  bikes: {
    items: "motorcycles",
    itemSingular: "a motorcycle",
    renter: "rider",
    packageLabel: "tours",
    hasTestRide: "Test ride scheduling",
    hasInsurance: "Ride insurance add-on",
  },
  cars: {
    items: "vehicles",
    itemSingular: "a vehicle",
    renter: "driver",
    packageLabel: "outstation trips",
    hasChauffeur: "Chauffeur option",
    hasInsurance: "Damage waiver add-on",
  },
  scooters: {
    items: "scooters",
    itemSingular: "a scooter",
    renter: "rider",
    packageLabel: "tours",
    hasInsurance: "Ride insurance add-on",
  },
  camping: {
    items: "gear items",
    itemSingular: "a gear item",
    renter: "camper",
    packageLabel: "trip kits",
    hasDelivery: "Delivery & pickup option",
  },
  events: {
    items: "equipment",
    itemSingular: "an equipment item",
    renter: "organiser",
    packageLabel: "party packages",
    hasDelivery: "Delivery & setup option",
  },
  cameras: {
    items: "gear items",
    itemSingular: "a gear item",
    renter: "creator",
    packageLabel: "rental kits",
    hasInsurance: "Damage insurance add-on",
  },
  ebikes: {
    items: "bicycles",
    itemSingular: "a bicycle",
    renter: "rider",
    packageLabel: "trip kits",
    hasTestRide: "Test ride scheduling",
    hasDelivery: "Delivery option",
  },
  other: {
    items: "items",
    itemSingular: "an item",
    renter: "customer",
  },
};

// ───── 5. PERSUASION CONSTANTS ─────

/**
 * SMART DEFAULTS: the set of features pre-enabled after a business type is chosen.
 * Anchors the user at mid-high value — they customize DOWN, not up from zero.
 * Pattern: booking (essential) + CMS (control) + a profit feature (growth).
 */
export const SMART_DEFAULTS: Record<BusinessType, string[]> = {
  bikes: ["onlineBooking", "packagesTours", "inventoryCMS"],
  cars: ["onlineBooking", "packagesTours", "inventoryCMS"],
  scooters: ["onlineBooking", "inventoryCMS"],
  camping: ["onlineBooking", "packagesTours", "deliveryScheduling"],
  events: ["onlineBooking", "packagesTours", "deliveryScheduling"],
  cameras: ["onlineBooking", "inventoryCMS", "deliveryScheduling"],
  ebikes: ["onlineBooking", "deliveryScheduling", "inventoryCMS"],
  other: ["onlineBooking", "inventoryCMS"],
};

/** Smart default banner shown after business type is chosen — {type} is replaced */
export const SMART_DEFAULT_BANNER =
  "We've started you with what most successful {type} rentals use — adjust freely.";

/**
 * POPULAR WITH: per-type, which 2-3 features are tagged "Popular with [type] businesses".
 * Displayed as a small green pill on the feature card.
 */
export const POPULAR_WITH: Record<BusinessType, string[]> = {
  bikes: ["onlineBooking", "packagesTours"],
  cars: ["onlineBooking", "packagesTours"],
  scooters: ["onlineBooking"],
  camping: ["onlineBooking", "deliveryScheduling"],
  events: ["packagesTours", "deliveryScheduling"],
  cameras: ["onlineBooking", "inventoryCMS"],
  ebikes: ["deliveryScheduling", "onlineBooking"],
  other: ["onlineBooking"],
};

/**
 * RECOMMENDED BYLINE: shown below the popluar-with tag on the profit feature card.
 */
export const PROFIT_FEATURE_HOOK = "Highest-profit feature";

// ───── 6. FEATURE CATALOGUE (one-time add-ons) ─────

export type FeatureId =
  | "onlineBooking"
  | "onlinePayments"
  | "kycUpload"
  | "packagesTours"
  | "deliveryScheduling"
  | "inventoryCMS"
  | "reviewsWall"
  | "flexiblePricing"
  | "blogGuides"
  | "whatsappNotifications";

/**
 * Every optional one-time feature a prospect can toggle on.
 * `appliesTo` restricts visibility by business type (empty = all types).
 * `perTypeLabel` overrides the label for specific verticals.
 * `isHighestProfit` = feature worth the strongest upsell push.
 *
 * Each feature card carries four progressive layers so the pitch reads as
 * business education, not hype — see references/copy guidance in the repo
 * README for the honesty rules these strings must follow (ranges, "typically
 * / often / can", never invented exact percentages):
 *   1. `label` + `hook`      — outcome-focused, always visible
 *   2. `whatYouGet`          — the concrete thing, one line, always visible
 *   3. `howItGrows`          — 2-3 honest sentences, shown in the expandable
 *   4. payoff chip           — computed at render time from the prospect's
 *                              own ROI inputs via `formatPaybackChip()`
 */
export interface FeatureConfig {
  id: FeatureId;
  label: string;
  perTypeLabel?: Partial<Record<BusinessType, string>>;
  /** Layer 1 — outcome-focused one-line hook, shown always under the label */
  hook: string;
  /** Layer 2 — "What it gives you": the concrete thing, one line, shown always */
  whatYouGet: string;
  /** Layer 3 — "How it grows your business": 2-3 honest, ranged sentences, shown in the expandable */
  howItGrows: string;
  /** Technical "what's involved" detail — nested deeper inside the expandable */
  whatIsInvolved: string;
  /** One-time price in INR */
  price: number;
  /** True for the Packages & Tours engine — the highest-margin upsell */
  isHighestProfit?: boolean;
  /** Which business types see this feature (empty = all) */
  appliesTo?: BusinessType[];
}

export const FEATURES: FeatureConfig[] = [
  {
    id: "onlineBooking",
    label: "Online booking with date/time slots",
    hook: "Take bookings 24/7 — even while you sleep",
    whatYouGet: "A live availability calendar customers book straight from — no back-and-forth calls.",
    howItGrows: "Right now every booking needs a phone call — you lose the customer who messages at 11pm or while you're on a ride. A booking system captures them automatically. Rentals that add online booking typically convert far more of their website visitors into paid bookings, because there's no waiting.",
    whatIsInvolved: "Real-time availability calendar synced to your schedule. Customers pick date and time, see live open slots, and confirm. You get an admin dashboard to manage bookings, block dates off, and view history.",
    price: 14000,
  },
  {
    id: "onlinePayments",
    label: "Online advance + refundable deposit",
    hook: "Lock in the booking before they change their mind",
    whatYouGet: "Razorpay/UPI checkout for an advance or deposit at the moment of booking, with auto-receipts.",
    howItGrows: "Taking an advance online means fewer no-shows and locked-in bookings. Even reducing no-shows by a couple a week protects real income — and a refundable deposit gives nervous first-time renters a safety net that makes them more willing to book at all.",
    whatIsInvolved: "Razorpay/UPI payment gateway integration. Collect advance amount or full payment at booking. Auto-generate receipts. Refundable deposit handling with partial or full refund workflow.",
    price: 10000,
  },
  {
    id: "kycUpload",
    label: "Digital KYC / document upload at booking",
    hook: "Verify renters before they ever touch your inventory",
    whatYouGet: "ID/license upload and admin verification, built right into the booking flow.",
    howItGrows: "Unverified renters are where most damage and theft losses start. Asking for ID upfront filters out the riskiest bookings and leaves a paper trail if something does go wrong — the kind of protection that quietly saves your margin over a season, not on any single booking.",
    whatIsInvolved: "Upload portal for driving license, Aadhaar, or other ID documents. Admin verification dashboard with approve/reject. Auto-reminder if docs not submitted 24 hours before pickup.",
    price: 6000,
    appliesTo: ["bikes", "cars", "scooters"],
  },
  {
    id: "packagesTours",
    label: "Packages & Tours engine",
    perTypeLabel: {
      bikes: "Tour packages engine",
      cars: "Outstation trip engine",
      camping: "Trip kit packages",
      events: "Party packages engine",
    },
    hook: "Turn your best trip into your best-selling product",
    whatYouGet: "Dedicated itinerary pages with day-by-day plans, inclusions, gallery, and per-seat booking.",
    howItGrows: "This is your highest-margin product. One tour booking can be worth 20+ daily rentals. A dedicated tours section with itineraries and online enquiry turns browsers into high-value trip bookings — often the single biggest revenue jump for a rental business.",
    whatIsInvolved: "Create curated packages with day-by-day itinerary, what is included, photo gallery, and per-seat or per-unit booking. Customers browse packages, see details, and book the whole bundle. Highest-margin feature in the catalogue.",
    price: 12000,
    isHighestProfit: true,
    appliesTo: ["bikes", "cars", "camping", "events"],
  },
  {
    id: "deliveryScheduling",
    label: "Delivery & pickup scheduling",
    hook: "Bring the rental to them — and reach people who'd never have called",
    whatYouGet: "A delivery/pickup slot picker with address capture, built into checkout.",
    howItGrows: "Plenty of customers won't rent from you simply because pickup is inconvenient. Offering delivery removes that friction and opens up a wider radius of customers — often people with less time to shop around, who typically book faster and cancel less.",
    whatIsInvolved: "Date and time picker for delivery and return. Address form with map pin. Admin dashboard to manage delivery routes and dispatch. SMS/email confirmation of delivery window.",
    price: 7000,
    appliesTo: ["camping", "events", "cameras", "ebikes"],
  },
  {
    id: "inventoryCMS",
    label: "Inventory management CMS",
    hook: "Update your listings yourself, in seconds",
    whatYouGet: "An admin panel to add items, edit prices, and toggle availability — no developer needed.",
    howItGrows: "Add new bikes, change prices, post tour dates yourself in seconds — no waiting, no developer fees every time. That saves money every month, and a site that visibly updates and stays fresh is also something Google tends to reward with better rankings over time.",
    whatIsInvolved: "Admin panel to add new inventory items, set prices, upload photos, mark availability. Edit or remove items at any time. Changes reflect live on the site instantly.",
    price: 9000,
  },
  {
    id: "reviewsWall",
    label: "Reviews wall + Google reviews integration",
    hook: "Let happy customers do your selling for you",
    whatYouGet: "Your Google rating and customer reviews, embedded live on your site.",
    howItGrows: "Social proof converts. Showing your Google rating and happy-customer stories on-site makes first-time visitors trust you enough to book instead of bouncing to a competitor — especially for renters who've never used you before and have nothing else to go on.",
    whatIsInvolved: "On-site review submission form with rating stars. Google Reviews API embed showing your latest Google ratings. Review moderation dashboard. Rich snippet schema for search results.",
    price: 4000,
  },
  {
    id: "flexiblePricing",
    label: "Flexible pricing tiers (hourly/daily/weekly/monthly)",
    hook: "Never leave money on the table on a slow Tuesday or a packed weekend",
    whatYouGet: "Separate hourly/daily/weekly/monthly rates, with weekday/weekend overrides.",
    howItGrows: "A single flat rate either scares off short-term renters or underprices your long bookings. Matching the price to how long someone actually wants your gear typically captures both ends of the market — the quick two-hour renter and the week-long trip — without you doing the math by hand each time.",
    whatIsInvolved: "Set different prices for hourly, daily, weekly, and monthly rentals. Customer sees the best rate for their chosen period. Seasonal pricing override. Weekend vs weekday rate support.",
    price: 5000,
  },
  {
    id: "blogGuides",
    label: "Blog / travel & how-to guides",
    hook: "Get found by people who haven't heard of you yet",
    whatYouGet: "A full blog engine with SEO-formatted articles, categories, and related posts.",
    howItGrows: "Every guide you publish is a page Google can keep ranking for months or years after you write it — a 'best trails near [city]' post can keep bringing visitors long after a social post has disappeared. It's slower than ads, but it's free traffic that compounds instead of switching off the day you stop paying.",
    whatIsInvolved: "Full blog engine with categories, tags, and author profiles. SEO-optimised article pages with meta tags. Related posts at the bottom. Social share buttons. Ideal for destination guides, how-to articles, and travel tips.",
    price: 5000,
  },
  {
    id: "whatsappNotifications",
    label: "WhatsApp automated booking notifications",
    hook: "Meet customers where they already check messages",
    whatYouGet: "Automated booking confirmations, pickup reminders, and receipts sent via WhatsApp.",
    howItGrows: "Email confirmations often sit unread for hours; WhatsApp messages tend to get seen much faster. Fewer missed pickups and fewer 'did my booking go through?' calls typically means less time on the phone for you and fewer customers who simply don't show up.",
    whatIsInvolved: "WhatsApp Business API integration. Auto-confirmation on booking. Reminder 24 hours before pickup. Payment receipt. Cancellation and update alerts. Two-way chat for customer queries.",
    price: 4000,
  },
];

// ───── 7. DESIGN TIERS ─────

export type DesignTierId = "standard" | "premiumMotion" | "signature3d";

export interface DesignTier {
  id: DesignTierId;
  label: string;
  /** Layer 1 — outcome-focused one-line hook, shown always under the label */
  hook: string;
  /** Layer 2 — "What it gives you": the concrete thing, one line, shown always */
  whatYouGet: string;
  /** Layer 3 — "How it grows your business": 2-3 honest, ranged sentences, shown in the expandable */
  howItGrows: string;
  /** One-time add-on price in INR (0 = included in base) */
  price: number;
}

export const DESIGN_TIERS: DesignTier[] = [
  {
    id: "standard",
    label: "Standard",
    hook: "The professional baseline every visitor expects",
    whatYouGet: "A clean, responsive, fast-loading layout — included in every build.",
    howItGrows: "A tidy, mobile-friendly site is table stakes now — without it, visitors bounce before they even see your prices. This tier gets you a credible, working storefront; the tiers above are about standing out once you've already cleared that bar.",
    price: 0,
  },
  {
    id: "premiumMotion",
    label: "Premium Motion",
    hook: "Make the first scroll feel like a premium brand, not a template",
    whatYouGet: "GSAP scroll animations, a parallax hero, and smooth micro-interactions throughout.",
    howItGrows: "First impressions form in the first few seconds on a page. A site with fluid, considered motion tends to read as noticeably more established than a static template — because most local competitors haven't invested in this. That perception gap is often what lets you hold a higher price without losing the booking.",
    price: 12000,
  },
  {
    id: "signature3d",
    label: "Signature 3D",
    hook: "Give people something they can't get from a phone-call booking",
    whatYouGet: "A rotating WebGL 3D model of your rental item as the hero — an interactive first impression.",
    howItGrows: "First impressions decide trust in about three seconds. A premium, animated site — especially one with a genuine 3D showcase — can make a small rental look established and trustworthy, letting you charge more and win the customer who's comparing you against a more basic competitor down the road.",
    price: 22000,
  },
];

// ───── 8. AI VISIBILITY LAUNCH PACKAGE ─────
//
// One flagship product with three build-levels the prospect picks ONE of.
// One-time launch projects with defined deliverables — never a monthly retainer.
// The middle tier (AI Ready) is visually elevated and pre-selected.

export type AiVisibilityLevel = 0 | 1 | 2 | 3; // 0 = none, 1 = Google Ready, 2 = AI Ready, 3 = AI Dominant

export interface AiVisibilityTier {
  id: 1 | 2 | 3;
  label: string;
  subtitle: string;
  icon: string;
  /**
   * Layer 1 — the outcome-focused hook shown below the label, always visible —
   * "Foundation SEO — rank on Google, yours forever" etc.
   */
  tagline: string;
  /** Layer 2 — "What it gives you": the concrete thing, one line, shown always */
  whatYouGet: string;
  /** Layer 3 — "How it grows your business": 2-3 honest, ranged sentences, shown in the expandable */
  howItGrows: string;
  /** Exact, scoped deliverables — printed in the email/PDF so the promise is concrete */
  deliverables: string[];
  /** One-time price in INR */
  price: number;
  /** Whether this tier should be pre-selected as default */
  isDefault?: boolean;
  /** Whether this tier is visually elevated as "Most Popular" */
  isBestSeller?: boolean;
  /** Optional badge text (e.g. "New" / "Best value") */
  badge?: string;
}

/**
 * The AI Visibility Launch Package — one flagship product, three levels.
 * Not toggles. The prospect picks ONE level (or none).
 * Every level lists exact deliverables so the email prints a concrete promise.
 */
export const AI_VISIBILITY_TIERS: AiVisibilityTier[] = [
  {
    id: 1,
    label: "Google Ready",
    icon: "🔍",
    subtitle: "₹18,000 one-time",
    tagline: "Foundation SEO — rank on Google, yours forever",
    whatYouGet: "Technical SEO, local keyword targeting, and a fully optimised Google Business Profile.",
    howItGrows: "Most renters never scroll past the first few Google results. Ranking well for '[item] rental [city]' means local searches route straight to you instead of a competitor — without paying for ads on every click. It's slower to kick in than paid ads, but once you rank, the traffic keeps coming without an ongoing spend.",
    deliverables: [
      "Technical SEO audit and fixes (speed, mobile, indexation)",
      "Local keyword research for '[item] rental [city]' and related terms",
      "Google Business Profile optimisation (photos, categories, posts)",
      "On-page SEO for all site pages (titles, meta, headings, alt text)",
      "Basic schema markup (LocalBusiness, Service)",
      "Sitemap submission to Google Search Console",
      "One-time delivery — you own every change, nothing expires",
    ],
    price: 18000,
  },
  {
    id: 2,
    label: "AI Ready",
    icon: "🤖",
    subtitle: "₹32,000 one-time",
    tagline: "Everything in Google Ready + full AEO — be the answer AI gives",
    isDefault: true,
    isBestSeller: true,
    badge: "Most Popular",
    whatYouGet: "Everything in Google Ready, plus FAQ and answer-block content built for AI Overviews and ChatGPT.",
    howItGrows: "AI tools like ChatGPT and Google's AI Overview are increasingly where people ask 'best [item] rental near me' before they ever scroll a normal search page. When your business is the one it names, that visitor typically arrives already leaning toward booking with you rather than comparison-shopping from scratch.",
    deliverables: [
      "Everything in Google Ready (SEO audit, local keywords, GBP, schema, sitemap)",
      "FAQ schema with 15+ question-answer pairs specific to your business",
      "Answer-block content — structured 'best [item] rental in [city]' pages",
      "AI-friendly content formatting (bullet points, tables, concise answers)",
      "Google AI Overview optimisation — structured data for featured snippets",
      "Baseline AI-citation report showing where your business appears in AI answers",
      "One-time delivery — you own every change, nothing expires",
    ],
    price: 32000,
  },
  {
    id: 3,
    label: "AI Dominant",
    icon: "🧠",
    subtitle: "₹55,000 one-time",
    tagline: "Everything above + full GEO — own every AI recommendation in your city",
    whatYouGet: "Everything above, plus entity building, directory consistency, and ongoing AI-citation tracking.",
    howItGrows: "This is about becoming the business AI engines already know and recommend by name — even in searches that don't mention your brand. It's still early days for this kind of optimisation, but businesses that build it now tend to keep that head start as more search moves into AI assistants.",
    deliverables: [
      "Everything in Google Ready and AI Ready (full SEO, AEO, FAQ, answer blocks)",
      "Generative Engine Optimisation — entity building across the web",
      "Directory and listing consistency audit (Google, Bing, Justdial, Sulekha, etc.)",
      "Authority signal building (backlinks, citations, NAP consistency)",
      "/llms.txt and /llms-full.txt files for AI crawler access",
      "Knowledge Panel optimisation for your business entity",
      "90-day citation-tracking report proving you're recommended by AI engines",
      "One-time delivery — you own every change, nothing expires",
    ],
    price: 55000,
  },
];

/** Agency benchmark line shown under the AI Visibility card */
export const AGENCY_COMPARISON_LINE =
  "Agencies bill ₹1,50,000+/year for ongoing AI optimisation. This is a one-time launch you own.";

// ───── 9. EXTRA SERVICES ─────

export interface ExtraOption {
  id: string;
  label: string;
  description: string;
  /** One-time price in INR */
  price: number;
}

export const EXTRA_OPTIONS: ExtraOption[] = [
  {
    id: "logoDesign",
    label: "Logo & brand identity",
    description: "Custom logo plus colour palette, typography system, and brand guidelines PDF",
    price: 4999,
  },
  {
    id: "photography",
    label: "Product photography",
    description: "Professional photo set — 10 shots per item, white background plus lifestyle",
    price: 2999,
  },
  {
    id: "promoVideo",
    label: "Promotional video",
    description: "30-second promo edit with slow-motion walkaround, music, captions, colour grade",
    price: 7999,
  },
  {
    id: "socialSetup",
    label: "Social media setup",
    description: "Instagram and Facebook profiles plus 10 launch posts and profile optimisation",
    price: 1499,
  },
];

// ───── 10. CARE REWARD LOYALTY LADDER ─────

export interface RewardTier {
  /** Minimum one-time build total (INR) to unlock this tier */
  threshold: number;
  label: string;
  /** Discount amount in INR (0 for service-based rewards) */
  discount: number;
  /** Detailed scope of what the reward includes */
  scope: string;
}

/**
 * THE KEY OFFER — small, bounded launch courtesy only:
 *   Under ₹25,000 → 3 months free maintenance.
 *   ₹25,000+      → 6 months free maintenance.
 *
 * Deliberately capped at 6 months — this is launch goodwill, not an ongoing
 * free commitment. Crossing ₹40,000 no longer grants free ongoing work; it
 * unlocks the paid, discounted Growth Partner retainer instead (see
 * GROWTH_RETAINER below) — real work, properly paid, just rewarded with a
 * better rate for committing to a serious build.
 */
export const CARE_REWARD_LADDER: RewardTier[] = [
  {
    threshold: 0,
    label: "3 months free maintenance",
    discount: 0,
    scope: "Bug fixes, security updates, uptime monitoring, and minor content changes for 3 months",
  },
  {
    threshold: 25000,
    label: "6 months free maintenance",
    discount: 0,
    scope: "Bug fixes, security updates, uptime monitoring, and minor content changes for 6 months",
  },
];

/** The mid-high target — crossing this unlocks the Founding Partner Growth Retainer rate */
export const CARE_REWARD_TARGET = 40000;

// ───── 11. TIMELINE ─────

export interface TimelineOption {
  id: "standard" | "fastTrack";
  label: string;
  description: string;
  /** Price multiplier: 1.0 for standard, 1.15 for fast-track */
  priceMultiplier: number;
}

export const TIMELINE_OPTIONS: TimelineOption[] = [
  {
    id: "standard",
    label: "Standard",
    description: "3–4 weeks delivery",
    priceMultiplier: 1,
  },
  {
    id: "fastTrack",
    label: "Fast-track",
    description: "2 weeks delivery (+15%)",
    priceMultiplier: 1.15,
  },
];

// ───── 12. MEETING SLOTS ─────

export interface MeetingSlotCategory {
  dayType: "weekday" | "weekend";
  label: string;
  slots: string[];
}

/** Meeting availability for the closing call */
export const MEETING_SLOTS: MeetingSlotCategory[] = [
  {
    dayType: "weekday",
    label: "Weekdays",
    slots: ["Morning 10–12", "Afternoon 1–4", "Evening 5–8"],
  },
  {
    dayType: "weekend",
    label: "Weekends",
    slots: ["Morning 10–12", "Afternoon 1–4", "Evening 5–8"],
  },
];

/** Quick "Call now" CTA via WhatsApp */
export const QUICK_CALL_LABEL = "Call me now";

/** Contact preferences for the closing call */
export const CONTACT_PREFERENCES = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "phone", label: "Phone call" },
  { id: "email", label: "Email" },
  { id: "inPerson", label: "In-person meeting" },
] as const;

export type ContactPreference = (typeof CONTACT_PREFERENCES)[number]["id"];

/** Day type options for meeting scheduler */
export const DAY_OPTIONS = [
  { id: "thisWeekend", label: "This weekend" },
  { id: "weekdays", label: "Weekdays" },
] as const;

export type DayOption = (typeof DAY_OPTIONS)[number]["id"];

/** Time slots for meetings */
export const TIME_SLOTS = [
  { id: "morning", label: "Morning 10–12" },
  { id: "afternoon", label: "Afternoon 1–4" },
  { id: "evening", label: "Evening 5–8" },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number]["id"];

/**
 * TEMPLATE SITE COMPARISON: honest contrast with a generic ₹15k template.
 * Every feature the prospect gets vs what a template doesn't have.
 */
export const TEMPLATE_COMPARISON: { feature: string; template: boolean; ours: boolean }[] = [
  { feature: "Custom responsive design", template: false, ours: true },
  { feature: "Home, About, Contact pages", template: true, ours: true },
  { feature: "Inventory showcase", template: true, ours: true },
  { feature: "Online booking with calendar", template: false, ours: true },
  { feature: "Payment + deposit collection", template: false, ours: true },
  { feature: "Digital KYC / document upload", template: false, ours: true },
  { feature: "Packages & tours engine", template: false, ours: true },
  { feature: "Delivery scheduling", template: false, ours: true },
  { feature: "Inventory management CMS", template: false, ours: true },
  { feature: "Reviews + Google integration", template: false, ours: true },
  { feature: "Flexible pricing tiers", template: false, ours: true },
  { feature: "Blog / content engine", template: false, ours: true },
  { feature: "WhatsApp automated notifications", template: false, ours: true },
  { feature: "SEO optimisation", template: false, ours: true },
  { feature: "AEO (AI answer) optimisation", template: false, ours: true },
  { feature: "SSL + domain deployment", template: false, ours: true },
  { feature: "Google Maps integration", template: false, ours: true },
  { feature: "WhatsApp booking button", template: false, ours: true },
  { feature: "After-launch support", template: false, ours: true },
];

// ───── 15B. POST-LAUNCH CARE PLANS (optional, never required) ─────
//
// Clearly separate from the one-time build. Client owns the site 100% either way.
// Care is optional ongoing support; Growth Partner is the ongoing SEO/AEO/content
// retainer for clients who want continuous growth after launch. Easy exit is what
// makes them commit.

export type CarePlanId = "none" | "care" | "growth";

export interface CarePlan {
  id: CarePlanId;
  label: string;
  /** Monthly price in INR */
  monthlyPrice: number;
  /**
   * Annual prepay price in INR (10 months for the price of 12 — "2 months free").
   * 0 means this plan is monthly-only and the billing toggle is hidden for it.
   */
  annualPrice: number;
  description: string;
  /** Feature bullets for the card */
  features: string[];
  /** Optional badge (e.g. "Most Popular" / "🏆 Founding Partner Rate") */
  badge?: string;
  /** Agency benchmark line per plan */
  agencyLine?: string;
}

export const CARE_PLANS: CarePlan[] = [
  {
    id: "none",
    label: "No plan — own it 100%",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "We hand over everything — your site, your data, your code — you own it all, forever. No recurring fees, no lock-in.",
    features: [],
  },
  {
    id: "care",
    label: "Care",
    monthlyPrice: 2500,
    annualPrice: 25000,
    description: "Hosting, backups, security, small updates, and uptime monitoring — so your site stays fast, secure, and current without you lifting a finger.",
    features: [
      "Managed hosting with CDN",
      "Weekly automated backups (30-day retention)",
      "Security patches & plugin updates",
      "Small content changes (up to 2 hours/month)",
      "99.9% uptime monitoring with instant alerts",
      "Priority email support (4-hour response)",
    ],
    agencyLine: "Agencies charge ₹5,000+/mo for hosting alone; this covers everything above for half that.",
  },
  {
    // Base/fallback entry at the standard rate — resolveGrowthPlanView() below
    // overrides price/description/badge/features once the ₹40k build threshold
    // is crossed. Kept here so "none"/"care" render from the same static list.
    id: "growth",
    label: "Growth Partner",
    monthlyPrice: 18000,
    annualPrice: 0,
    description: "Ongoing SEO, AEO, content, and reporting — real monthly work to keep growing your bookings after launch, at our standard independent rate.",
    badge: "Most Popular",
    features: [],
    agencyLine: "Agencies typically charge ₹25,000+/month for this scope of ongoing SEO, content, and reporting work.",
  },
];

/** Per-day framing, used for plans billed monthly */
export function getCarePlanPerDay(plan: CarePlan, annual: boolean): number {
  const price = annual && plan.annualPrice > 0 ? plan.annualPrice : plan.monthlyPrice * 12;
  return Math.round(price / 365);
}

/** Get annual savings text for a plan — only meaningful when the plan offers annual prepay */
export function getCarePlanAnnualNote(plan: CarePlan): string {
  if (plan.monthlyPrice <= 0 || plan.annualPrice <= 0) return "";
  const annualStandard = plan.monthlyPrice * 12;
  const savings = annualStandard - plan.annualPrice;
  return `Pay yearly, get 2 months free — save ${formatPrice(savings)}/year`;
}

/** Retention line shown with every plan */
export const CARE_RETENTION_LINE = "Cancel anytime — your site and data always stay yours.";

// ───── 15C. GROWTH PARTNER RETAINER — the ₹40k "Founding Partner" unlock ─────
//
// Crossing ₹40,000 on the one-time build no longer grants free ongoing work.
// It unlocks a genuinely discounted rate on real, paid monthly growth work —
// the Founding Partner rate — for committing to a serious build. Everything
// here is real paid work at a real (discounted) rate; nothing is unlimited
// or free forever.

export interface GrowthRetainer {
  name: string;
  /** Standard monthly rate in INR — always available, no threshold required */
  standardMonthlyPrice: number;
  /** Discounted monthly rate in INR, unlocked at CARE_REWARD_TARGET+ */
  foundingPartnerMonthlyPrice: number;
  /** How many months the Founding Partner rate is locked in for */
  foundingPartnerLockMonths: number;
  /** Whether the first month is free for Founding Partners */
  firstMonthFree: boolean;
  /** Concrete, printable monthly scope — never vague "forever SEO" */
  scopeBullets: string[];
}

export const GROWTH_RETAINER: GrowthRetainer = {
  name: "Growth Partner",
  standardMonthlyPrice: 18000,
  foundingPartnerMonthlyPrice: 12000,
  foundingPartnerLockMonths: 12,
  firstMonthFree: true,
  scopeBullets: [
    "Up to 15 target keywords tracked and optimised",
    "3 AI-citation optimisations/month — ChatGPT, Google AI Overview, Perplexity",
    "2 SEO-optimised blog posts/month",
    "Google Business Profile management & posts",
    "Monthly ranking + leads report",
  ],
};

/** Whether the one-time build total has crossed the Founding Partner threshold */
export function isFoundingPartnerUnlocked(grandTotal: number): boolean {
  return grandTotal >= CARE_REWARD_TARGET;
}

/** The Growth Partner monthly rate the prospect actually qualifies for right now */
export function getGrowthRetainerMonthlyPrice(grandTotal: number): number {
  return isFoundingPartnerUnlocked(grandTotal)
    ? GROWTH_RETAINER.foundingPartnerMonthlyPrice
    : GROWTH_RETAINER.standardMonthlyPrice;
}

/**
 * True year-one saving from the Founding Partner rate lock, against the
 * standard rate — (standard − founding) × lock months. Deliberately excludes
 * the first-month-free perk from this figure so the number stays strictly
 * accurate as a rate comparison; first month free is called out separately.
 */
export function getFoundingPartnerSavings(): number {
  return (
    (GROWTH_RETAINER.standardMonthlyPrice - GROWTH_RETAINER.foundingPartnerMonthlyPrice) *
    GROWTH_RETAINER.foundingPartnerLockMonths
  );
}

/**
 * Builds the "growth" CarePlan view for the prospect's current build total —
 * the single source of truth both the UI and the emailed scope render from,
 * so the discounted rate and perks are never out of sync.
 */
export function resolveGrowthPlanView(grandTotal: number): CarePlan {
  const base = CARE_PLANS.find((p) => p.id === "growth")!;
  const unlocked = isFoundingPartnerUnlocked(grandTotal);
  if (!unlocked) {
    return { ...base, features: [...GROWTH_RETAINER.scopeBullets] };
  }
  return {
    ...base,
    monthlyPrice: GROWTH_RETAINER.foundingPartnerMonthlyPrice,
    badge: "🏆 Founding Partner Rate",
    description: `${formatPrice(GROWTH_RETAINER.foundingPartnerMonthlyPrice)}/mo — your Founding Partner rate, normally ${formatPrice(GROWTH_RETAINER.standardMonthlyPrice)}. You save ${formatPrice(getFoundingPartnerSavings())} in year one. Plus your first month free and priority support.`,
    features: [
      ...GROWTH_RETAINER.scopeBullets,
      "🎁 First month free",
      "⚡ Priority support",
      `🔒 ₹${GROWTH_RETAINER.foundingPartnerMonthlyPrice.toLocaleString("en-IN")}/mo locked for ${GROWTH_RETAINER.foundingPartnerLockMonths} months`,
    ],
  };
}

// ───── 16. DONE-FOR-YOU PACKAGES ─────
//
// Three named anchor tiers. The itemized configurator still drives pricing;
// these tiers reframe the user's selections as a recognizable package.
// Growth is the "Most Chosen" sweet spot — elevated visually, best margin, best value.

export type PackageId = "launch" | "growth" | "dominate";

export interface PackageTier {
  id: PackageId;
  label: string;
  emoji: string;
  /** Target one-time price (approximate anchor) */
  price: number;
  tagline: string;
  /** Badge for the sweet-spot tier (Growth = "Most Chosen") */
  badge?: string;
  /** CSS accent color for the card */
  color: string;
  /** Features that define this package tier */
  features: FeatureId[];
  /** The minimum design tier this package represents */
  minDesignTier: DesignTierId;
  /** The min AI visibility level this package includes */
  minAiLevel: AiVisibilityLevel;
}

export const PACKAGES: PackageTier[] = [
  {
    id: "launch",
    label: "Launch",
    emoji: "🥉",
    price: 28000,
    tagline: "Get online and get found.",
    badge: undefined,
    color: "var(--pine)",
    features: ["onlineBooking", "whatsappNotifications"],
    minDesignTier: "standard",
    minAiLevel: 1,
  },
  {
    id: "growth",
    label: "Growth",
    emoji: "🥈",
    price: 58000,
    tagline: "Capture bookings while you sleep and get recommended by AI.",
    badge: "Most Chosen",
    color: "var(--ember)",
    features: [
      "onlineBooking",
      "onlinePayments",
      "packagesTours",
      "inventoryCMS",
      "reviewsWall",
      "flexiblePricing",
      "blogGuides",
      "whatsappNotifications",
    ],
    minDesignTier: "premiumMotion",
    minAiLevel: 2,
  },
  {
    id: "dominate",
    label: "Dominate",
    emoji: "🥇",
    price: 95000,
    tagline: "Own your city online and in every AI answer.",
    badge: undefined,
    color: "var(--gold)",
    features: [
      "onlineBooking",
      "onlinePayments",
      "kycUpload",
      "packagesTours",
      "deliveryScheduling",
      "inventoryCMS",
      "reviewsWall",
      "flexiblePricing",
      "blogGuides",
      "whatsappNotifications",
    ],
    minDesignTier: "signature3d",
    minAiLevel: 3,
  },
];

/**
 * Score how closely a user's current selections match a package.
 * Higher score = closer match. Used to highlight the best-fitting tier.
 * Weight: feature match 40%, design tier 30%, AI visibility 30%.
 */
export function scorePackageMatch(
  enabledFeatures: FeatureId[],
  designTier: DesignTierId,
  aiVisibilityLevel: AiVisibilityLevel,
  pkg: PackageTier,
): number {
  const enabledSet = new Set(enabledFeatures);
  let featureScore = 0;
  const totalFeatures = pkg.features.length;
  for (const f of pkg.features) {
    if (enabledSet.has(f)) featureScore++;
  }
  // Penalty for features NOT in the package that the user enabled (over-engineering)
  for (const f of enabledFeatures) {
    if (!pkg.features.includes(f)) featureScore -= 0.3;
  }
  const featureNorm = totalFeatures > 0 ? featureScore / totalFeatures : 0;

  const designLevels: DesignTierId[] = ["standard", "premiumMotion", "signature3d"];
  const userDesignIdx = designLevels.indexOf(designTier);
  const pkgDesignIdx = designLevels.indexOf(pkg.minDesignTier);
  const designScore = userDesignIdx >= pkgDesignIdx ? 1 : 0.25;

  const aiScore = aiVisibilityLevel >= pkg.minAiLevel ? 1 : aiVisibilityLevel === 0 ? 0 : 0.25;

  return featureNorm * 0.4 + designScore * 0.3 + aiScore * 0.3;
}

/**
 * Find the package that best matches the user's current selections.
 * Tiebreaker: higher package price wins (biases toward aspirational).
 */
export function detectPackage(
  enabledFeatures: FeatureId[],
  designTier: DesignTierId,
  aiVisibilityLevel: AiVisibilityLevel,
): PackageTier {
  let best = PACKAGES[0]!;
  let bestScore = -Infinity;
  for (const pkg of PACKAGES) {
    const score = scorePackageMatch(enabledFeatures, designTier, aiVisibilityLevel, pkg);
    if (score > bestScore || (score === bestScore && pkg.price > best.price)) {
      bestScore = score;
      best = pkg;
    }
  }
  return best;
}

/**
 * Compute the delta (additional cost) to upgrade to a given package tier.
 * Returns 0 if the user's current grandTotal already meets or exceeds the package price.
 */
export function computeUpgradeDelta(packagePrice: number, currentGrandTotal: number): number {
  return Math.max(0, packagePrice - currentGrandTotal);
}

/** Get the missing features to reach a given package (not yet enabled) */
export function getMissingFeatures(
  enabledFeatures: FeatureId[],
  pkg: PackageTier,
): FeatureId[] {
  const set = new Set(enabledFeatures);
  return pkg.features.filter((f) => !set.has(f));
}

/** Get the "extra" features the user enabled that exceed a given package */
export function getExtraFeatures(
  enabledFeatures: FeatureId[],
  pkg: PackageTier,
): FeatureId[] {
  const pkgSet = new Set(pkg.features);
  return enabledFeatures.filter((f) => !pkgSet.has(f));
}

// ───── 17. ROI DEFAULTS ─────

/** ROI defaults: placeholder values for the ROI calculator.
 * The prospect enters their average booking value and expected extra bookings/month.
 */
export const ROI_DEFAULTS = {
  avgBookingValue: 1200,
  extraBookingsPerMonth: 10,
};

/**
 * VALUE-PRICING LAYER: The single highest-leverage psychological move.
 * Re-frames every price as an investment against real revenue.
 */

/** Default average booking value per business type — changes the ROI number dramatically */
export const DEFAULT_AVG_BOOKING_VALUE: Record<BusinessType, number> = {
  bikes: 2500,
  cars: 4000,
  scooters: 1500,
  camping: 3500,
  events: 15000,
  cameras: 5000,
  ebikes: 800,
  other: 1200,
};

/** Value anchor text — shown above the estimate bar on every step */
export const VALUE_ANCHOR =
  "Businesses like yours lose customers every day to competitors who show up first on Google and AI. This is what fixing that is worth.";

/** Default extra bookings per month attributable to AI visibility alone */
export const DEFAULT_AI_EXTRA_BOOKINGS: number = 5;

/**
 * Compute the annual revenue impact of AI visibility.
 * @returns annualRevenue, annualRevenueFormatted, returnMultiple, returnMultipleFormatted
 */
export function computeAiVisibilityROI(
  tierPrice: number,
  avgBookingValue: number,
  extraBookingsPerMonth: number,
): {
  annualRevenue: number;
  annualRevenueFormatted: string;
  returnMultiple: number;
  returnMultipleFormatted: string;
} {
  const annualRevenue = avgBookingValue * extraBookingsPerMonth * 12;
  const returnMultiple = tierPrice > 0 ? Math.round((annualRevenue / tierPrice) * 10) / 10 : 0;
  return {
    annualRevenue,
    annualRevenueFormatted: formatPrice(annualRevenue),
    returnMultiple,
    returnMultipleFormatted: returnMultiple.toFixed(1),
  };
}

/** Get the default booking value for a business type */
export function getDefaultBookingValue(type: BusinessType | null): number {
  if (!type) return ROI_DEFAULTS.avgBookingValue;
  return DEFAULT_AVG_BOOKING_VALUE[type] ?? ROI_DEFAULTS.avgBookingValue;
}

/** Compute payback period in weeks */
export function computePaybackWeeks(
  totalInvestment: number,
  avgBookingValue: number,
  extraBookingsPerMonth: number,
): number {
  if (avgBookingValue <= 0 || extraBookingsPerMonth <= 0) return Infinity;
  const monthlyRevenue = avgBookingValue * extraBookingsPerMonth;
  if (monthlyRevenue <= 0) return Infinity;
  return totalInvestment / (monthlyRevenue / 4.33); // approximate weeks
}

/**
 * Layer 4 — "Why it pays for itself" chip copy, computed live from the
 * prospect's OWN ROI inputs (their avg. booking value + extra bookings/month).
 * Always framed as a rough, labelled illustration against a single item's
 * price — never a guarantee, never an invented percentage.
 */
export function formatPaybackChip(
  price: number,
  avgBookingValue: number,
  extraBookingsPerMonth: number,
): string {
  if (price <= 0) return "Included — nothing extra to recover";
  const weeks = computePaybackWeeks(price, avgBookingValue, extraBookingsPerMonth);
  if (!Number.isFinite(weeks) || weeks <= 0) {
    return "Add your booking numbers to see roughly how fast this pays for itself";
  }
  if (weeks < 1) {
    return "Pays for itself in your first extra booking, at your numbers";
  }
  if (weeks <= 8) {
    const w = Math.max(1, Math.round(weeks));
    return `~${w} week${w === 1 ? "" : "s"} to pay for itself, at your numbers`;
  }
  const months = Math.max(1, Math.round(weeks / 4.33));
  return `~${months} month${months === 1 ? "" : "s"} to pay for itself, at your numbers`;
}

// ───── 13. GHOST EFFECT ─────

/** Duration in ms that a disabled feature lingers as a ghost in the preview */
export const GHOST_DURATION_MS = 1000;

// ───── 14. PREVIEW THEME ─────

/**
 * Tokens used by the live-preview panel to render a realistic site preview.
 * Matches the brand tokens in tailwind.config.ts.
 */
/**
 * Map of business type → optional .glb model URL for the Signature 3D hero.
 * When set, the ThreeScene will attempt to load this model instead of rendering
 * the primitive fallback. Set to null/undefined to use the built-in primitive model.
 * Expected format: absolute URL or path relative to public/
 */
export const MODEL_3D_URLS: Partial<Record<BusinessType, string | null>> = {
  bikes: null,
  cars: null,
  scooters: null,
  camping: null,
  events: null,
  cameras: null,
  ebikes: null,
  other: null,
};

// ───── 14B. BRAND CUSTOMIZATION ("Make it yours") ─────
//
// The prospect's own colours, logo, theme (light/dark), and font pairing —
// this is the ownership hook. Every choice here re-tints the live preview
// (and rides along to the PDF/email so we know their taste before the call).

export interface BrandPreset {
  id: string;
  name: string;
  /** Primary action colour — buttons, links, hero glow */
  primary: string;
  /** Secondary accent — badges, ratings, highlights */
  accent: string;
}

export const BRAND_PRESETS: BrandPreset[] = [
  { id: "sunsetEmber", name: "Sunset Ember", primary: "#E85D2A", accent: "#E0A536" },
  { id: "midnightBlue", name: "Midnight Blue", primary: "#3B63E0", accent: "#8FA8F0" },
  { id: "forestAdventure", name: "Forest Adventure", primary: "#2F6D4F", accent: "#C98A3E" },
  { id: "royalMaroon", name: "Royal Maroon", primary: "#8A1F3D", accent: "#D4A24C" },
  { id: "monoLuxe", name: "Mono Luxe", primary: "#2A2A2E", accent: "#C9A227" },
  { id: "oceanTeal", name: "Ocean Teal", primary: "#0E7C86", accent: "#4FD1C5" },
];

export type BrandThemeId = (typeof BRAND_PRESETS)[number]["id"] | "custom";
export type BrandVibe = "dark" | "light";

export interface FontPairing {
  id: "modern" | "classic" | "bold";
  name: string;
  description: string;
  display: string;
  body: string;
}

export type FontPairingId = FontPairing["id"];

/** Body stays on the loaded Inter face across pairings — only the display face changes, a standard editorial convention */
export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Sora + Inter",
    display: "var(--font-display), Sora, system-ui, sans-serif",
    body: "var(--font-body), Inter, system-ui, sans-serif",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Playfair Display + Inter",
    display: "var(--font-classic), 'Playfair Display', Georgia, serif",
    body: "var(--font-body), Inter, system-ui, sans-serif",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Poppins + Inter",
    display: "var(--font-bold), Poppins, system-ui, sans-serif",
    body: "var(--font-body), Inter, system-ui, sans-serif",
  },
];

export interface BrandState {
  themeId: BrandThemeId;
  customPrimary: string;
  customAccent: string;
  vibe: BrandVibe;
  fontPairing: FontPairingId;
  /** Data URL of the uploaded logo (resized client-side before storage), or null for the wordmark fallback */
  logoDataUrl: string | null;
}

export function createDefaultBrandState(): BrandState {
  return {
    themeId: "sunsetEmber",
    customPrimary: "#E85D2A",
    customAccent: "#E0A536",
    vibe: "dark",
    fontPairing: "modern",
    logoDataUrl: null,
  };
}

/** Resolves the active primary/accent/name for whatever the prospect picked (preset or custom) */
export function resolveBrandColors(brand: BrandState): { primary: string; accent: string; name: string } {
  if (brand.themeId === "custom") {
    return { primary: brand.customPrimary, accent: brand.customAccent, name: "Custom palette" };
  }
  const preset = BRAND_PRESETS.find((p) => p.id === brand.themeId) ?? BRAND_PRESETS[0]!;
  return { primary: preset.primary, accent: preset.accent, name: preset.name };
}

// ── Colour-contrast guard (WCAG relative luminance) ──

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

/** Given any background hex, returns a guaranteed-readable near-black or near-white foreground */
export function getReadableTextColor(bgHex: string): string {
  const lum = relativeLuminance(hexToRgb(bgHex));
  return lum > 0.45 ? "#14181B" : "#FFFFFF";
}

/** Hex colour → rgba() string at a given alpha, for tinted glows/badges */
export function hexToRgbaString(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

const BRAND_DARK_BASE = { bg: "#0E1116", surface: "#171C22", text: "#E8E2D4", hairline: "rgba(255,255,255,0.08)" };
const BRAND_LIGHT_BASE = { bg: "#FAF8F4", surface: "#FFFFFF", text: "#1B1D22", hairline: "rgba(20,20,25,0.08)" };

/**
 * Resolves a prospect's brand choices into the theme object the live preview
 * renders from — flat hex/rgba tokens so a re-tint is just new values
 * crossfading in, no structural change.
 */
export function getBrandTheme(brand: BrandState) {
  const { primary, accent } = resolveBrandColors(brand);
  const base = brand.vibe === "light" ? BRAND_LIGHT_BASE : BRAND_DARK_BASE;
  const pairing = FONT_PAIRINGS.find((f) => f.id === brand.fontPairing) ?? FONT_PAIRINGS[0]!;
  return {
    "--bg": base.bg,
    "--surface": base.surface,
    "--sand": base.text,
    "--ember": primary,
    "--gold": accent,
    "--pine": accent,
    "--hairline": base.hairline,
    "--font-display": pairing.display,
    "--font-body": pairing.body,
  } as const;
}

// ───── 15. WIZARD STEPS ─────

export const WIZARD_STEPS = [
  { id: "businessType", label: "Business type" },
  { id: "identity", label: "Your business" },
  { id: "brand", label: "Make it yours" },
  { id: "inventory", label: "Inventory & scale" },
  { id: "features", label: "Core features" },
  { id: "design", label: "Design tier" },
  { id: "seo", label: "Search & AI" },
  { id: "extras", label: "Extra services" },
  { id: "timeline", label: "Timeline" },
  { id: "meeting", label: "Schedule" },
  { id: "results", label: "Summary" },
  { id: "complete", label: "Complete" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

// ───── 16B. CREDIBILITY & RISK-REDUCTION ELEMENTS ─────
//
// Every element here is designed to reduce perceived risk so higher prices
// feel EARNED, not steep. All copy is honest and deliverable.

/** Referral Reward System */
export const REFERRAL_DISCOUNT_PCT = 25;
export const REFERRAL_WINDOW_DAYS = 15;

/** Small honest upsells offered AT close (each one-line, real work) */
export interface CloseUpsell {
  id: string;
  label: string;
  price: number;
}
export const CLOSE_UPSELLS: CloseUpsell[] = [
  { id: "copywriting", label: "Professional copywriting", price: 6000 },
  { id: "photography", label: "Photography coordination", price: 4000 },
  { id: "launch_kit", label: "Launch announcement kit", price: 3000 },
];

/** Number of local businesses used in the trust strip */
export const TRUSTED_BUSINESS_COUNT = 12;

/** Typical investment anchor shown under the estimate bar */
export const TYPICAL_INVESTMENT_RANGE = { low: 45000, high: 70000 };

/**
 * Milestone payment breakdown — shown near the send button.
 * "50% to start → see design in 10 days → pay 30% only when you approve → 20% at launch."
 * The strongest anti-haggle tool: they never pay for work they haven't seen.
 */
export const MILESTONE_PAYMENT_TEXT =
  "50% to start → you see the design in 10 days → pay 30% only when you approve → 20% at launch. You never pay for work you haven't seen.";

/**
 * Guarantee line — real, safe risk removal, not a fake money-back gimmick.
 * "If the design direction isn't right after the first preview, we revise until it
 *  is — before you pay the next milestone."
 */
export const GUARANTEE_LINE =
  "If the design direction isn't right after the first preview, we revise until it is — before you pay the next milestone.";

/**
 * Recent work proof card data.
 * Social proof anchors quality expectations upward.
 */
export interface RecentWork {
  name: string;
  description: string;
  outcomes: string[];
  /** Optional link to the actual site */
  url?: string;
}

export const RECENT_WORKS: RecentWork[] = [
  {
    name: "Dencity Dental Care",
    description: "Premium dental clinic — full website with online booking, AI-powered concierge, and SEO/AEO optimisation",
    outcomes: [
      "Booked ₹30,000 premium tier in the first meeting",
      "10+ treatment pages ranking on page 1 of Google within 60 days",
      "Patients can book, verify insurance, and get AI-powered treatment guidance — all without a phone call",
    ],
  },
];

// ───── 16. HELPERS ─────

/** Get the label set for a business type — falls back to "other" */
export function getLabels(type: BusinessType | null): BusinessTypeLabels {
  if (!type) return LABEL_MAP.other;
  return LABEL_MAP[type] ?? LABEL_MAP.other;
}

/** Get features visible for a given business type */
export function getVisibleFeatures(type: BusinessType | null): FeatureConfig[] {
  return FEATURES.filter((f) => {
    if (!f.appliesTo || f.appliesTo.length === 0) return true;
    if (!type) return false;
    return (f.appliesTo as readonly string[]).includes(type);
  });
}

/** Get the feature label with per-type override */
export function getFeatureLabel(
  feature: FeatureConfig,
  type: BusinessType | null,
): string {
  if (type && feature.perTypeLabel?.[type]) {
    return feature.perTypeLabel[type];
  }
  return feature.label;
}

/** Compute the highest reward tier reachable from a total */
export function getApplicableReward(total: number): RewardTier | null {
  let best: RewardTier | null = null;
  for (const r of CARE_REWARD_LADDER) {
    if (total >= r.threshold) best = r;
  }
  return best;
}

/** Format INR with currency symbol and locale */
export function formatPrice(amount: number): string {
  return `${CURRENCY}${amount.toLocaleString("en-IN")}`;
}

/** Compute a low-high range (±15%) for the estimate bar */
export function getEstimateRange(amount: number): { low: number; high: number } {
  return {
    low: Math.round(amount * 0.85),
    high: Math.round(amount * 1.15),
  };
}
