"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  type FeatureId,
  type FeatureConfig,
  type DesignTierId,
  type AiVisibilityLevel,
  type CarePlanId,
  type ExtraOption,
  type RewardTier,
  type BusinessType,
  type WizardStepId,
  type BrandState,
  type BrandThemeId,
  type BrandVibe,
  type FontPairingId,
  createDefaultBrandState,
  BASE_PRICE,
  EXTRA_ITEM_PRICE,
  MIN_INVENTORY,
  MAX_INVENTORY,
  EXTRA_LOCATION_PRICE,
  MIN_LOCATIONS,
  MAX_LOCATIONS,
  FEATURES,
  DESIGN_TIERS,
  AI_VISIBILITY_TIERS,
  EXTRA_OPTIONS,
  TIMELINE_OPTIONS,
  SMART_DEFAULTS,
  getApplicableReward,
  CARE_REWARD_TARGET,
  getDefaultBookingValue,
  CLOSE_UPSELLS,
} from "./config";

// ───── PERSISTENCE ─────

const STORAGE_KEY = "rental-scope-studio-state";

function saveToStorage(state: CartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* storage full — silently skip */ }
}

function loadFromStorage(): CartState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CartState;
  } catch { return null; }
}

function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ───── STATE ─────

export interface CartState {
  businessType: BusinessType | null;
  businessName: string;
  city: string;
  /** Prospect's contact info for the email reply */
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  googleRating: number;
  designTier: DesignTierId;
  enabledFeatures: FeatureId[];
  aiVisibilityLevel: AiVisibilityLevel;
  extras: string[];
  /** Extra inventory items beyond the 8 included (range 0–32) */
  extraItems: number;
  /** Extra delivery/pickup locations beyond the 1 included (range 0–9) */
  extraLocations: number;
  timeline: "standard" | "fastTrack";
  /** Meeting scheduling */
  preferredDay: string | null;
  preferredSlot: string | null;
  contactPreference: string | null;
  /** Optional post-launch care plan */
  carePlan: CarePlanId;
  carePlanBilling: "monthly" | "annual";
  /** "Make it yours" brand customization — colours, logo, theme, fonts */
  brand: BrandState;
  /** ROI calculator inputs */
  avgBookingValue: number;
  extraBookingsPerMonth: number;
  /** Referral Reward */
  referredBusinessName: string;
  referredContact: string;
  quoteId: string;
  /** Phase 2 items */
  phase2Features: FeatureId[];
  phase2Extras: string[];
  /** Close / Agreement state */
  closeUpsells: string[];
  retainerOptIn: boolean;
  /** Wizard step tracking */
  wizardStep: WizardStepId;
  /** Whether smart defaults have been applied for the current business type */
  smartDefaultsApplied: boolean;
  /** Whether state was restored from storage (show welcome-back) */
  restored: boolean;
}

export type CartAction =
  | { type: "SET_BUSINESS_TYPE"; businessType: BusinessType | null }
  | { type: "SET_BUSINESS_NAME"; name: string }
  | { type: "SET_CITY"; city: string }
  | { type: "SET_OWNER_NAME"; name: string }
  | { type: "SET_OWNER_PHONE"; phone: string }
  | { type: "SET_OWNER_EMAIL"; email: string }
  | { type: "SET_GOOGLE_RATING"; rating: number }
  | { type: "SET_DESIGN_TIER"; tier: DesignTierId }
  | { type: "TOGGLE_FEATURE"; featureId: FeatureId }
  | { type: "SET_AI_VISIBILITY_LEVEL"; level: AiVisibilityLevel }
  | { type: "TOGGLE_EXTRA"; optionId: string }
  | { type: "TOGGLE_PHASE2_FEATURE"; featureId: FeatureId }
  | { type: "TOGGLE_PHASE2_EXTRA"; optionId: string }
  | { type: "SET_EXTRA_ITEMS"; count: number }
  | { type: "SET_EXTRA_LOCATIONS"; count: number }
  | { type: "SET_TIMELINE"; timeline: "standard" | "fastTrack" }
  | { type: "SET_PREFERRED_DAY"; day: string | null }
  | { type: "SET_PREFERRED_SLOT"; slot: string | null }
  | { type: "SET_CONTACT_PREFERENCE"; preference: string | null }
  | { type: "SET_CARE_PLAN"; plan: CarePlanId }
  | { type: "SET_CARE_PLAN_BILLING"; billing: "monthly" | "annual" }
  | { type: "SET_BRAND_THEME"; themeId: BrandThemeId }
  | { type: "SET_BRAND_CUSTOM_COLOR"; channel: "primary" | "accent"; color: string }
  | { type: "SET_BRAND_VIBE"; vibe: BrandVibe }
  | { type: "SET_BRAND_FONT_PAIRING"; pairing: FontPairingId }
  | { type: "SET_BRAND_LOGO"; dataUrl: string | null }
  | { type: "SET_AVG_BOOKING_VALUE"; value: number }
  | { type: "SET_EXTRA_BOOKINGS_PER_MONTH"; value: number }
  | { type: "SET_REFERRED_BUSINESS_NAME"; name: string }
  | { type: "SET_REFERRED_CONTACT"; contact: string }
  | { type: "TOGGLE_CLOSE_UPSELL"; optionId: string }
  | { type: "SET_RETAINER_OPT_IN"; value: boolean }
  | { type: "SET_WIZARD_STEP"; step: WizardStepId }
  | { type: "APPLY_SMART_DEFAULTS" }
  | { type: "RESET_SCOPE" };

function createInitialState(saved?: CartState | null): CartState {
  if (saved) {
    return {
      ...saved,
      avgBookingValue: saved.avgBookingValue ?? getDefaultBookingValue(saved.businessType),
      brand: saved.brand ?? createDefaultBrandState(),
      enabledFeatures: saved.enabledFeatures ?? [],
      extras: saved.extras ?? [],
      phase2Features: saved.phase2Features ?? [],
      phase2Extras: saved.phase2Extras ?? [],
      closeUpsells: saved.closeUpsells ?? [],
      retainerOptIn: saved.retainerOptIn ?? false,
      restored: true,
    };
  }
  return {
    businessType: null,
    businessName: "",
    city: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
      googleRating: 0,
      carePlan: "none",
      carePlanBilling: "monthly",
      designTier: "standard",
      brand: createDefaultBrandState(),
    enabledFeatures: [],
    aiVisibilityLevel: 0,
    extras: [],
    extraItems: 0,
    extraLocations: 0,
    timeline: "standard",
    preferredDay: null,
    preferredSlot: null,
    contactPreference: null,
    avgBookingValue: getDefaultBookingValue(null),
    extraBookingsPerMonth: 10,
    referredBusinessName: "",
    referredContact: "",
    quoteId: `HT-R-2026-${Math.floor(Math.random() * 900) + 100}`,
    phase2Features: [],
    phase2Extras: [],
    closeUpsells: [],
    retainerOptIn: false,
    wizardStep: "businessType",
    smartDefaultsApplied: false,
    restored: false,
  };
}

// ───── REDUCER ─────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_BUSINESS_TYPE": {
      const bt = action.businessType;
      // If changing to a different type, reset features and smart defaults
      if (bt !== state.businessType) {
        return {
          ...state,
          businessType: bt,
          avgBookingValue: getDefaultBookingValue(bt),
          enabledFeatures: [],
          phase2Features: [],
          smartDefaultsApplied: false,
          wizardStep: bt ? "identity" : "businessType",
          designTier: "standard",
          aiVisibilityLevel: 0,
          extras: [],
          phase2Extras: [],
          extraItems: 0,
          extraLocations: 0,
          timeline: "standard",
          carePlan: "none",
          carePlanBilling: "monthly",
          closeUpsells: [],
          retainerOptIn: false,
        };
      }
      return { ...state, businessType: bt };
    }
    case "SET_BUSINESS_NAME":
      return { ...state, businessName: action.name };
    case "SET_CITY":
      return { ...state, city: action.city };
    case "SET_OWNER_NAME":
      return { ...state, ownerName: action.name };
    case "SET_OWNER_PHONE":
      return { ...state, ownerPhone: action.phone };
    case "SET_OWNER_EMAIL":
      return { ...state, ownerEmail: action.email };
    case "SET_GOOGLE_RATING":
      return { ...state, googleRating: Math.max(0, Math.min(5, action.rating)) };
    case "SET_DESIGN_TIER":
      return { ...state, designTier: action.tier };
    case "TOGGLE_FEATURE": {
      const enabled = state.enabledFeatures.includes(action.featureId)
        ? state.enabledFeatures.filter((f) => f !== action.featureId)
        : [...state.enabledFeatures, action.featureId];
      // If disabling, also remove from phase2
      const p2 = !enabled.includes(action.featureId)
        ? state.phase2Features.filter((f) => f !== action.featureId)
        : state.phase2Features;
      return { ...state, enabledFeatures: enabled, phase2Features: p2 };
    }
    case "SET_AI_VISIBILITY_LEVEL":
      return { ...state, aiVisibilityLevel: action.level };
    case "TOGGLE_EXTRA": {
      const extras = state.extras.includes(action.optionId)
        ? state.extras.filter((e) => e !== action.optionId)
        : [...state.extras, action.optionId];
      const p2e = !extras.includes(action.optionId)
        ? state.phase2Extras.filter((e) => e !== action.optionId)
        : state.phase2Extras;
      return { ...state, extras, phase2Extras: p2e };
    }
    case "TOGGLE_PHASE2_FEATURE": {
      const p2 = state.phase2Features.includes(action.featureId)
        ? state.phase2Features.filter((f) => f !== action.featureId)
        : [...state.phase2Features, action.featureId];
      return { ...state, phase2Features: p2 };
    }
    case "TOGGLE_PHASE2_EXTRA": {
      const p2 = state.phase2Extras.includes(action.optionId)
        ? state.phase2Extras.filter((e) => e !== action.optionId)
        : [...state.phase2Extras, action.optionId];
      return { ...state, phase2Extras: p2 };
    }
    case "SET_EXTRA_ITEMS":
      return { ...state, extraItems: Math.max(0, Math.min(action.count, MAX_INVENTORY - MIN_INVENTORY)) };
    case "SET_EXTRA_LOCATIONS":
      return { ...state, extraLocations: Math.max(0, Math.min(action.count, MAX_LOCATIONS - MIN_LOCATIONS)) };
    case "SET_TIMELINE":
      return { ...state, timeline: action.timeline };
    case "SET_PREFERRED_DAY":
      return { ...state, preferredDay: action.day };
    case "SET_PREFERRED_SLOT":
      return { ...state, preferredSlot: action.slot };
    case "SET_CONTACT_PREFERENCE":
      return { ...state, contactPreference: action.preference };
    case "SET_CARE_PLAN":
      return { ...state, carePlan: action.plan };
    case "SET_CARE_PLAN_BILLING":
      return { ...state, carePlanBilling: action.billing };
    case "SET_BRAND_THEME":
      return { ...state, brand: { ...state.brand, themeId: action.themeId } };
    case "SET_BRAND_CUSTOM_COLOR":
      return {
        ...state,
        brand: {
          ...state.brand,
          themeId: "custom",
          ...(action.channel === "primary"
            ? { customPrimary: action.color }
            : { customAccent: action.color }),
        },
      };
    case "SET_BRAND_VIBE":
      return { ...state, brand: { ...state.brand, vibe: action.vibe } };
    case "SET_BRAND_FONT_PAIRING":
      return { ...state, brand: { ...state.brand, fontPairing: action.pairing } };
    case "SET_BRAND_LOGO":
      return { ...state, brand: { ...state.brand, logoDataUrl: action.dataUrl } };
    case "SET_AVG_BOOKING_VALUE":
      return { ...state, avgBookingValue: Math.max(0, action.value) };
    case "SET_EXTRA_BOOKINGS_PER_MONTH":
      return { ...state, extraBookingsPerMonth: Math.max(0, action.value) };
    case "SET_REFERRED_BUSINESS_NAME":
      return { ...state, referredBusinessName: action.name };
    case "SET_REFERRED_CONTACT":
      return { ...state, referredContact: action.contact };
    case "TOGGLE_CLOSE_UPSELL": {
      const up = state.closeUpsells.includes(action.optionId)
        ? state.closeUpsells.filter((id) => id !== action.optionId)
        : [...state.closeUpsells, action.optionId];
      return { ...state, closeUpsells: up };
    }
    case "SET_RETAINER_OPT_IN":
      return { ...state, retainerOptIn: action.value };
    case "SET_WIZARD_STEP":
      return { ...state, wizardStep: action.step };
    case "APPLY_SMART_DEFAULTS": {
      if (!state.businessType || state.smartDefaultsApplied) return state;
      const defaults = SMART_DEFAULTS[state.businessType] as FeatureId[];
      return {
        ...state,
        enabledFeatures: defaults,
        smartDefaultsApplied: true,
      };
    }
    case "RESET_SCOPE":
      clearStorage();
      return {
        ...createInitialState(),
        carePlan: "none",
        carePlanBilling: "monthly",
        brand: createDefaultBrandState(),
      };
    default:
      return state;
  }
}

// ───── COMPUTED VALUES ─────

export interface CartTotals {
  basePrice: number;
  designTierPrice: number;
  featuresTotal: number;
  aiVisibilityPrice: number;
  extrasTotal: number;
  scaleTotal: number;
  subtotal: number;
  timelineMultiplier: number;
  grandTotal: number;
  reward: RewardTier | null;
  /** Whether the build has crossed CARE_REWARD_TARGET and unlocked the Founding Partner Growth Retainer rate */
  foundingPartnerUnlocked: boolean;
  foundingPartnerProgress: number;
  foundingPartnerRemaining: number;
  estimateLow: number;
  estimateHigh: number;
  phase1Total: number;
  phase2Total: number;
  closeUpsellsTotal: number;
  finalTotal: number;
}

function computeTotals(state: CartState): CartTotals {
  const basePrice = BASE_PRICE;

  const designTierPrice =
    DESIGN_TIERS.find((t) => t.id === state.designTier)?.price ?? 0;

  const featuresTotal = state.enabledFeatures
    .map((fid) => FEATURES.find((f) => f.id === fid))
    .filter((f): f is FeatureConfig => f != null)
    .reduce((sum, f) => sum + f.price, 0);

  /* AI Visibility Launch Package — flat one-time price per level (no reward discount) */
  const selectedAiTier = AI_VISIBILITY_TIERS.find((t) => t.id === state.aiVisibilityLevel);
  const aiVisibilityPrice = selectedAiTier?.price ?? 0;

  const extrasTotal = state.extras
    .map((id) => EXTRA_OPTIONS.find((e) => e.id === id))
    .filter((e): e is ExtraOption => e != null)
    .reduce((sum, e) => sum + e.price, 0);

  const scaleTotal =
    state.extraItems * EXTRA_ITEM_PRICE +
    state.extraLocations * EXTRA_LOCATION_PRICE;

  const subtotal = basePrice + designTierPrice + featuresTotal + aiVisibilityPrice + extrasTotal + scaleTotal;

  const timeline = TIMELINE_OPTIONS.find((t) => t.id === state.timeline);
  const timelineMultiplier = timeline?.priceMultiplier ?? 1;

  const grandTotal = Math.round(subtotal * timelineMultiplier);

  // Compute Phase 2 totals
  const p2FeaturesTotal = state.phase2Features
    .map((fid) => FEATURES.find((f) => f.id === fid)?.price ?? 0)
    .reduce((sum, p) => sum + p, 0);
  const p2ExtrasTotal = state.phase2Extras
    .map((id) => EXTRA_OPTIONS.find((e) => e.id === id)?.price ?? 0)
    .reduce((sum, p) => sum + p, 0);
  const phase2Total = Math.round((p2FeaturesTotal + p2ExtrasTotal) * timelineMultiplier);
  
  // Close upsells
  const closeUpsellsTotal = state.closeUpsells
    .map((id) => CLOSE_UPSELLS.find((u) => u.id === id)?.price ?? 0)
    .reduce((sum, p) => sum + p, 0);

  const phase1Total = grandTotal - phase2Total + closeUpsellsTotal;

  // Small, bounded launch-goodwill tier (3/6 months free maintenance)
  const reward = getApplicableReward(phase1Total);

  // Founding Partner Growth Retainer unlock
  const foundingPartnerUnlocked = phase1Total >= CARE_REWARD_TARGET;
  const foundingPartnerProgress = Math.min(100, (phase1Total / CARE_REWARD_TARGET) * 100);
  const foundingPartnerRemaining = Math.max(0, CARE_REWARD_TARGET - phase1Total);

  const estimateLow = Math.round(phase1Total * 0.85);
  const estimateHigh = Math.round(phase1Total * 1.15);

  return {
    basePrice,
    designTierPrice,
    featuresTotal,
    aiVisibilityPrice,
    extrasTotal,
    scaleTotal,
    subtotal,
    timelineMultiplier,
    grandTotal: grandTotal + closeUpsellsTotal,
    reward,
    foundingPartnerUnlocked,
    foundingPartnerProgress,
    foundingPartnerRemaining,
    estimateLow,
    estimateHigh,
    phase1Total,
    phase2Total,
    closeUpsellsTotal,
    finalTotal: phase1Total,
  };
}

// ───── CONTEXT ─────

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totals: CartTotals;
}

const CartCtx = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const saved = typeof window !== "undefined" ? loadFromStorage() : null;
  const [state, dispatch] = useReducer(cartReducer, saved, createInitialState);
  const totals = computeTotals(state);
  const initRef = useRef(false);

  // Auto-save to localStorage on every state change (throttled)
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      return;
    }
    const timer = setTimeout(() => saveToStorage(state), 300);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <CartCtx.Provider value={{ state, dispatch, totals }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
