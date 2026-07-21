"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CURRENCY,
  BASE_PRICE,
  BASE_INCLUDES,
  FEATURES,
  DESIGN_TIERS,
  AI_VISIBILITY_TIERS,
  EXTRA_OPTIONS,
  TIMELINE_OPTIONS,
  EXTRA_ITEM_PRICE,
  MIN_INVENTORY,
  MAX_INVENTORY,
  EXTRA_LOCATION_PRICE,
  MIN_LOCATIONS,
  MAX_LOCATIONS,
  WIZARD_STEPS,
  getVisibleFeatures,
  getLabels,
  getFeatureLabel,
  POPULAR_WITH,
  PROFIT_FEATURE_HOOK,
  SMART_DEFAULT_BANNER,
  CARE_REWARD_TARGET,
  OWNER_EMAIL,
  OWNER_WHATSAPP,
  AGENCY_COMPARISON_LINE,
  DAY_OPTIONS,
  TIME_SLOTS,
  CONTACT_PREFERENCES,
  TEMPLATE_COMPARISON,
  computePaybackWeeks,
  formatPaybackChip,
  formatPrice,
  DEFAULT_AI_EXTRA_BOOKINGS,
  VALUE_ANCHOR,
  computeAiVisibilityROI,
  CARE_PLANS,
  CARE_RETENTION_LINE,
  getCarePlanPerDay,
  getCarePlanAnnualNote,
  GROWTH_RETAINER,
  isFoundingPartnerUnlocked,
  getFoundingPartnerSavings,
  resolveGrowthPlanView,
  type BusinessType,
  type FeatureId,
  type DesignTierId,
  type WizardStepId,
  type AiVisibilityLevel,
  type CarePlanId,
  type CarePlan,
  MILESTONE_PAYMENT_TEXT,
  GUARANTEE_LINE,
  RECENT_WORKS,
  BRAND_PRESETS,
  FONT_PAIRINGS,
  getBrandTheme,
  getReadableTextColor,
  hexToRgbaString,
  resolveBrandColors,
  type BrandVibe,
  TRUSTED_BUSINESS_COUNT,
  TYPICAL_INVESTMENT_RANGE,
  REFERRAL_DISCOUNT_PCT,
  REFERRAL_WINDOW_DAYS,
  CLOSE_UPSELLS,
} from "@/lib/config";
import { useCart, type CartState, type CartTotals, type CartAction } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ───── Odometer hook ─────

function useOdometer(value: number, duration = 600): number {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const current = Math.round(from + (to - from) * ease(p));
      setDisplay(current);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    prevRef.current = to;
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return display;
}

// ───── Step indicator ─────

function StepIndicator({
  steps,
  current,
  onNavigate,
}: {
  steps: readonly { id: string; label: string }[];
  current: string;
  onNavigate: (id: WizardStepId) => void;
}) {
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
      {steps.slice(1).map((step, i) => { // skip "businessType" — already picked
        const stepIdx = i + 1;
        const isActive = step.id === current;
        const isPast = stepIdx < idx;
        return (
          <button
            key={step.id}
            onClick={() => isPast && onNavigate(step.id as WizardStepId)}
            className={cn(
              "flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg transition-all duration-250",
              isActive
                ? "bg-ember/10 text-ember"
                : isPast
                  ? "text-sand/40 hover:text-sand/60 cursor-pointer"
                  : "text-sand/20 cursor-default",
            )}
          >
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold",
              isActive ? "bg-ember text-white" : isPast ? "bg-pine/30 text-pine" : "bg-hairline text-sand/20",
            )}>
              {isPast ? "✓" : stepIdx}
            </span>
            <span className="text-[10px] font-display font-semibold whitespace-nowrap hidden sm:inline">
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ───── Section header ─────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-base font-semibold text-sand">{title}</h3>
      {subtitle && <p className="text-xs text-sand/40 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ───── Base package card (always visible) ─────

function BasePackage() {
  return (
    <div className="rounded-xl border border-pine/20 bg-pine/5 p-4 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-display text-sm font-bold text-sand">Base package</span>
          <span className="block text-[10px] text-sand/30 mt-0.5">Every build starts here</span>
        </div>
        <div className="font-display text-lg font-bold text-ember">
          {CURRENCY}{BASE_PRICE.toLocaleString("en-IN")}
        </div>
      </div>
      <ul className="space-y-1.5">
        {BASE_INCLUDES.map((item) => (
          <li key={item} className="text-[11px] text-sand/50 flex items-start gap-2">
            <span className="text-pine mt-0.5 shrink-0">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ───── Scale slider ─────

function ScaleSlider({
  label,
  value,
  min,
  max,
  pricePerUnit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  pricePerUnit: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-sand">{label}</span>
        <div className="text-right">
          <span className="font-mono text-sm font-bold text-gold">
            +{CURRENCY}{(value * pricePerUnit).toLocaleString("en-IN")}
          </span>
          <span className="block text-[10px] text-sand/30">
            {value + min} total · {value > 0 ? `${value} × ${CURRENCY}${pricePerUnit.toLocaleString("en-IN")}` : `${min} included`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-sand/30 w-6 text-right">{min}</span>
        <input
          type="range"
          min={0}
          max={max - min}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #E85D2A 0%, #E85D2A ${(value / (max - min)) * 100}%, rgba(255,255,255,0.08) ${(value / (max - min)) * 100}%, rgba(255,255,255,0.08) 100%)`,
            accentColor: "#E85D2A",
          }}
        />
        <span className="text-[10px] text-sand/30 w-6">{max}</span>
      </div>
    </div>
  );
}

// ───── Design tier radio ─────

function DesignTierCard({
  tier,
  selected,
  onSelect,
  payoffChip,
}: {
  tier: (typeof DESIGN_TIERS)[number];
  selected: boolean;
  onSelect: () => void;
  payoffChip: string;
}) {
  const [showGrowth, setShowGrowth] = useState(false);
  const accentClass = tier.id === "signature3d" ? "text-gold" : tier.id === "premiumMotion" ? "text-ember" : "text-pine";

  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className={cn(
        "relative w-full rounded-xl border p-4 text-left transition-all duration-250 cursor-pointer",
        selected
          ? tier.id === "signature3d"
            ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(224,165,54,0.08)]"
            : tier.id === "premiumMotion"
              ? "border-ember bg-ember/5"
              : "border-pine/30 bg-pine/5"
          : "border-hairline bg-surface/50 hover:border-sand/20"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <span className={cn(
            "font-display text-sm font-bold",
            selected ? "text-sand" : "text-sand/60"
          )}>
            {tier.label}
          </span>
          {/* Layer 1 — outcome hook, always visible */}
          <span className={cn("block text-[10px] mt-0.5 leading-relaxed font-medium", selected ? accentClass : "text-sand/35")}>
            {tier.hook}
          </span>
          {/* Layer 2 — what you get, always visible */}
          <span className="block text-[10px] text-sand/30 mt-0.5 leading-relaxed">
            {tier.whatYouGet}
          </span>
        </div>
        <div className="text-right shrink-0 ml-3">
          {tier.price === 0 ? (
            <span className="text-[10px] text-pine font-semibold">Included</span>
          ) : (
            <div>
              <span className={cn(
                "font-display text-base font-bold",
                tier.id === "signature3d" ? "text-gold" : "text-ember"
              )}>
                +{CURRENCY}{tier.price.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div className={cn(
          "w-2 h-2 rounded-full",
          tier.id === "signature3d" ? "bg-gold" : tier.id === "premiumMotion" ? "bg-ember" : "bg-pine"
        )} />
      )}

      {/* Layers 3-4 — how it grows your business + payoff, in the expandable */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowGrowth((v) => !v); }}
        className="flex items-center gap-1 text-[9px] text-sand/25 hover:text-sand/50 cursor-pointer transition-colors mt-2"
      >
        <svg className={cn("w-2.5 h-2.5 transition-transform", showGrowth && "rotate-90")} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
        {showGrowth ? "Hide" : "See how this grows your business"} ↓
      </button>
      <AnimatePresence>
        {showGrowth && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 space-y-2" onClick={(e) => e.stopPropagation()}>
              <p className="text-[9px] text-sand/40 leading-relaxed">{tier.howItGrows}</p>
              <span className={cn(
                "inline-flex items-center gap-1.5 text-[8px] font-semibold px-2 py-1 rounded-full",
                tier.id === "signature3d" ? "text-gold bg-gold/10" : "text-ember bg-ember/10"
              )}>
                ⚡ {payoffChip}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ───── Feature toggle with persuasion ─────

function FeatureToggle({
  feature,
  enabled,
  onToggle,
  businessType,
  isPopular,
  payoffChip,
}: {
  feature: (typeof FEATURES)[number];
  enabled: boolean;
  onToggle: () => void;
  businessType: BusinessType | null;
  isPopular: boolean;
  payoffChip: string;
}) {
  const label = getFeatureLabel(feature, businessType);
  const [showGrowth, setShowGrowth] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className={cn(
          "flex items-start justify-between w-full rounded-lg border px-3.5 py-3 transition-all duration-250 text-left",
          enabled
            ? "border-ember/30 bg-ember/5"
            : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
        )}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center transition-all duration-250 shrink-0",
              enabled ? "border-ember bg-ember" : "border-sand/20"
            )}
          >
            {enabled && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </div>
          <div className="text-left min-w-0">
            <span className={cn("text-sm", enabled ? "text-sand" : "text-sand/50")}>
              {label}
            </span>
            {/* Layer 1 — outcome hook, always visible */}
            <p className={cn("text-[10px] mt-0.5 leading-relaxed font-medium", enabled ? "text-ember" : "text-sand/35")}>
              {feature.hook}
            </p>
            {/* Layer 2 — what you get, always visible */}
            <p className="text-[10px] text-sand/30 mt-0.5 leading-relaxed">{feature.whatYouGet}</p>

            {/* Popular with tag */}
            {isPopular && !enabled && (
              <span className="inline-block mt-1 text-[8px] text-pine bg-pine/10 px-1.5 py-0.5 rounded-full font-semibold tracking-wider uppercase">
                Popular with {businessType} businesses
              </span>
            )}

            {/* Profit feature ribbon */}
            {feature.isHighestProfit && (
              <span className="inline-block mt-1 text-[8px] text-gold bg-gold/10 px-1.5 py-0.5 rounded-full font-semibold tracking-wider uppercase">
                {PROFIT_FEATURE_HOOK}
              </span>
            )}
          </div>
        </div>

        <div className="text-right ml-3 shrink-0">
          <span className={cn(
            "text-[11px] whitespace-nowrap transition-all duration-250",
            enabled ? "text-ember font-semibold" : "text-sand/40"
          )}>
            +{CURRENCY}{feature.price.toLocaleString("en-IN")}
          </span>
        </div>
      </motion.button>

      {/* Layers 3-4 — how it grows your business + payoff, in the expandable */}
      <button
        onClick={() => setShowGrowth(!showGrowth)}
        className="flex items-center gap-1 text-[9px] text-sand/25 hover:text-sand/50 cursor-pointer transition-colors mt-1 ml-1"
      >
        <svg className={cn("w-2.5 h-2.5 transition-transform", showGrowth && "rotate-90")} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
        {showGrowth ? "Hide" : "See how this grows your business"} ↓
      </button>
      <AnimatePresence>
        {showGrowth && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 px-3.5 py-3 rounded-lg bg-white/[0.03] border border-hairline space-y-2">
              <div>
                <span className="text-[8px] text-ember font-mono uppercase tracking-wider">How it grows your business</span>
                <p className="text-[10px] text-sand/45 leading-relaxed mt-1">{feature.howItGrows}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[8px] font-semibold text-gold bg-gold/10 px-2 py-1 rounded-full">
                ⚡ {payoffChip}
              </span>
              <details className="group pt-1">
                <summary className="flex items-center gap-1 text-[8px] text-sand/20 hover:text-sand/40 cursor-pointer list-none transition-colors">
                  <svg className="w-2.5 h-2.5 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                  Technical details
                </summary>
                <p className="mt-1 text-[9px] text-sand/30 leading-relaxed pl-3">{feature.whatIsInvolved}</p>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ───── AI Visibility Launch Package card ─────

function AiVisibilityCard({
  tier,
  selected,
  onSelect,
}: {
  tier: (typeof AI_VISIBILITY_TIERS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const [showGrowth, setShowGrowth] = useState(false);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className={cn(
        "relative w-full rounded-xl border p-4 text-left transition-all duration-250 cursor-pointer",
        selected
          ? tier.isBestSeller
            ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(224,165,54,0.08)]"
            : "border-ember/30 bg-ember/5"
          : "border-hairline bg-surface/50 hover:border-sand/20"
      )}
    >
      {/* Most Popular ribbon */}
      {tier.isBestSeller && (
        <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-ink"
          style={{ background: "var(--gold)" }}>
          <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 5h5l-4 3 1.5 5L8 11l-4 3 1.5-5-4-3h5z"/></svg>
          {tier.badge}
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{tier.icon}</span>
            <span className={cn(
              "font-display text-sm font-bold",
              selected ? "text-sand" : "text-sand/60"
            )}>
              {tier.label}
            </span>
          </div>
          {/* Layer 1 — outcome hook, always visible */}
          <p className={cn("text-[10px] mt-1 leading-relaxed font-medium", selected ? "text-ember" : "text-sand/35")}>
            {tier.tagline}
          </p>
          {/* Layer 2 — what you get, always visible */}
          <p className="text-[10px] text-sand/30 mt-0.5 leading-relaxed">{tier.whatYouGet}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className={cn(
            "font-display text-base font-bold",
            selected ? "text-ember" : "text-sand/40"
          )}>
            +{CURRENCY}{tier.price.toLocaleString("en-IN")}
          </span>
          <span className="block text-[8px] text-sand/20 mt-0.5">one-time</span>
        </div>
      </div>

      {/* Deliverables list (expands on select) */}
      {selected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-2 pt-2 space-y-1 overflow-hidden"
          style={{ borderTop: "1px solid var(--hairline)" }}
        >
          <span className="text-[8px] text-sand/30 font-mono uppercase tracking-wider">Included</span>
          <ul className="space-y-1 mt-1">
            {tier.deliverables.map((d, i) => (
              <li key={i} className="text-[9px] text-sand/50 flex items-start gap-1.5">
                <span className="text-pine mt-px shrink-0">✓</span>
                {d}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Selected indicator */}
      {selected && (
        <div className={cn(
          "w-2 h-2 rounded-full mt-2",
          tier.isBestSeller ? "bg-gold" : "bg-ember"
        )} />
      )}

      {/* Layers 3-4 — how it grows your business + ROI, in the expandable */}
      {selected && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setShowGrowth((v) => !v); }}
            className="flex items-center gap-1 text-[9px] text-sand/25 hover:text-sand/50 cursor-pointer transition-colors mt-2"
          >
            <svg className={cn("w-2.5 h-2.5 transition-transform", showGrowth && "rotate-90")} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
            {showGrowth ? "Hide" : "See how this grows your business"} ↓
          </button>
          <AnimatePresence>
            {showGrowth && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p
                  className="mt-1.5 text-[9px] text-sand/40 leading-relaxed"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tier.howItGrows}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

// ───── AI Visibility ROI mini-calculator ─────

function AiVisibilityROI({
  tierPrice,
  businessType,
  defaultBookingValue,
}: {
  tierPrice: number;
  businessType: BusinessType | null;
  defaultBookingValue: number;
}) {
  const [avgBookingValue, setAvgBookingValue] = useState(defaultBookingValue);
  const [extraBookings, setExtraBookings] = useState(DEFAULT_AI_EXTRA_BOOKINGS);

  if (tierPrice <= 0) return null;

  const roi = computeAiVisibilityROI(tierPrice, avgBookingValue, extraBookings);

  return (
    <div className="rounded-xl border border-gold/15 bg-gold/5 p-4 mt-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-sm">📈</span>
        <span className="text-[10px] font-display font-bold text-sand">What this is worth to you</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[8px] text-sand/30 font-mono tracking-wider mb-1 uppercase">
            Avg. booking value (₹)
          </label>
          <input
            type="number"
            value={avgBookingValue || ""}
            onChange={(e) => setAvgBookingValue(Math.max(0, Number(e.target.value)))}
            className="w-full bg-surface/50 border border-hairline rounded-lg px-2.5 py-2 text-xs text-sand font-mono outline-none focus:border-gold/50 transition-colors"
            placeholder={String(defaultBookingValue)}
          />
        </div>
        <div>
          <label className="block text-[8px] text-sand/30 font-mono tracking-wider mb-1 uppercase">
            Extra bookings/month from AI
          </label>
          <input
            type="number"
            value={extraBookings || ""}
            onChange={(e) => setExtraBookings(Math.max(0, Number(e.target.value)))}
            className="w-full bg-surface/50 border border-hairline rounded-lg px-2.5 py-2 text-xs text-sand font-mono outline-none focus:border-gold/50 transition-colors"
            placeholder={String(DEFAULT_AI_EXTRA_BOOKINGS)}
          />
        </div>
      </div>

      {avgBookingValue > 0 && extraBookings > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] text-sand/40 leading-relaxed">
            If AI Visibility brings you just <strong>{extraBookings} extra booking{extraBookings !== 1 ? "s" : ""}</strong>{/* */}
            {" "}a month at {formatPrice(avgBookingValue)} each, that&apos;s{" "}
            <strong className="text-gold">{roi.annualRevenueFormatted}/year</strong> — from a one-time{" "}
            {formatPrice(tierPrice)} investment. Illustrative, using the numbers you entered — not a guarantee.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-sand/30">That&apos;s roughly a</span>
            <span className="font-display text-lg font-bold text-gold">{roi.returnMultipleFormatted}x</span>
            <span className="text-[10px] text-sand/30">return in year one, at your numbers.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ───── Extra option toggle ─────

function ExtraToggle({
  option,
  selected,
  onToggle,
}: {
  option: (typeof EXTRA_OPTIONS)[number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "flex items-start justify-between w-full rounded-lg border px-3.5 py-3 transition-all duration-250 text-left",
        selected
          ? "border-gold/30 bg-gold/5"
          : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={cn(
            "w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center transition-all shrink-0",
            selected ? "border-gold bg-gold" : "border-sand/20"
          )}
        >
          {selected && (
            <svg className="w-2.5 h-2.5 text-ink" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
        <div className="text-left min-w-0">
          <span className={cn("text-sm", selected ? "text-sand" : "text-sand/50")}>
            {option.label}
          </span>
          <p className="text-[10px] text-sand/30 mt-0.5 leading-relaxed">{option.description}</p>
        </div>
      </div>
      <span className="text-[11px] text-sand/40 whitespace-nowrap ml-3 shrink-0">
        +{CURRENCY}{option.price.toLocaleString("en-IN")}
      </span>
    </motion.button>
  );
}

// ───── Brand customization: "Make it yours" ─────

/** Resizes an uploaded image client-side (max 240px edge) to a small PNG data URL — keeps localStorage light */
function resizeImageToDataUrl(file: File, maxDim = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas unavailable")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function BrandPresetSwatch({
  preset,
  selected,
  onSelect,
}: {
  preset: (typeof BRAND_PRESETS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-250",
        selected ? "border-ember bg-ember/5" : "border-hairline bg-surface/50 hover:border-sand/20"
      )}
    >
      <div className="flex items-center gap-1.5 w-full">
        <span className="w-6 h-6 rounded-full border border-white/10 shrink-0" style={{ background: preset.primary }} />
        <span className="w-6 h-6 rounded-full border border-white/10 shrink-0 -ml-3" style={{ background: preset.accent }} />
        {selected && (
          <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: preset.primary }}>
            <svg className="w-2.5 h-2.5" style={{ color: getReadableTextColor(preset.primary) }} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </span>
        )}
      </div>
      <span className={cn("text-xs font-semibold font-display", selected ? "text-sand" : "text-sand/60")}>
        {preset.name}
      </span>
    </motion.button>
  );
}

function FontPairingOption({
  pairing,
  selected,
  onSelect,
}: {
  pairing: (typeof FONT_PAIRINGS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between w-full rounded-lg border px-3.5 py-3 transition-all duration-250 text-left",
        selected ? "border-ember/30 bg-ember/5" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
      )}
    >
      <div>
        <div
          className="text-lg leading-none mb-1"
          style={{ color: selected ? "var(--ember)" : "var(--sand)", fontFamily: pairing.display }}
        >
          Aa
        </div>
        <span className={cn("text-xs font-semibold", selected ? "text-sand" : "text-sand/60")}>{pairing.name}</span>
        <p className="text-[9px] text-sand/30 mt-0.5">{pairing.description}</p>
      </div>
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
          selected ? "border-ember bg-ember" : "border-sand/20"
        )}
      >
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
      </div>
    </motion.button>
  );
}

function VibeToggle({ vibe, onChange }: { vibe: BrandVibe; onChange: (v: BrandVibe) => void }) {
  return (
    <div className="flex rounded-lg border border-hairline p-1 bg-white/[0.02]">
      {(["dark", "light"] as BrandVibe[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all duration-250",
            vibe === v ? "bg-ember text-white" : "text-sand/40 hover:text-sand/70"
          )}
        >
          {v === "dark" ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M13.5 9.5a5.5 5.5 0 01-6.9-5.4A5.5 5.5 0 108 13.5a5.5 5.5 0 005.5-4z" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13" strokeLinecap="round" /></svg>
          )}
          {v === "dark" ? "Dark" : "Light"}
        </button>
      ))}
    </div>
  );
}

function LogoUploadField({
  logoDataUrl,
  businessName,
  onUpload,
  onRemove,
}: {
  logoDataUrl: string | null;
  businessName: string;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Image too large — try under 8MB"); return; }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onUpload(dataUrl);
    } catch {
      setError("Couldn't read that image — try another file");
    } finally {
      setBusy(false);
    }
  }, [onUpload]);

  return (
    <div className="rounded-xl border border-hairline bg-surface/50 p-4">
      <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-2 uppercase">
        Logo (optional)
      </label>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg border border-hairline flex items-center justify-center shrink-0 overflow-hidden bg-white/5">
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoDataUrl} alt="Logo preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[9px] text-sand/20 text-center px-1 leading-tight">
              {(businessName || "Your Biz").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-[11px] font-semibold px-3 py-2 rounded-lg border border-hairline text-sand/70 hover:text-sand hover:border-sand/30 transition-colors disabled:opacity-50"
          >
            {busy ? "Uploading…" : logoDataUrl ? "Replace" : "Upload logo"}
          </button>
          {logoDataUrl && (
            <button
              onClick={onRemove}
              className="text-[11px] text-sand/30 hover:text-sand/60 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-[9px] text-red-400 mt-2">{error}</p>}
      {!logoDataUrl && !error && (
        <p className="text-[9px] text-sand/20 mt-2">No logo yet? We&apos;ll show a clean wordmark of your business name instead.</p>
      )}
    </div>
  );
}

// ───── Timeline card ─────

function TimelineCard({
  option,
  selected,
  onSelect,
}: {
  option: (typeof TIMELINE_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "flex-1 rounded-xl border p-4 text-left transition-all duration-250",
        selected
          ? "border-ember/30 bg-ember/5"
          : "border-hairline bg-surface/50 hover:border-sand/20"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn("font-display text-sm font-semibold", selected ? "text-sand" : "text-sand/60")}>
          {option.label}
        </span>
        {option.priceMultiplier > 1 && (
          <span className="text-[10px] text-ember font-semibold">+15%</span>
        )}
      </div>
      <p className="text-[11px] text-sand/30">{option.description}</p>
    </motion.button>
  );
}

// ───── Live estimate bar ─────

function EstimateBar({ growthToast }: { growthToast: { text: string; key: number } | null }) {
  const { state, totals } = useCart();
  const displayTotal = useOdometer(totals.grandTotal);
  const [expanded, setExpanded] = useState(false);

  const isGold = totals.foundingPartnerUnlocked;

  return (
    <div className="sticky bottom-0 z-30 border-t bg-ink/95 backdrop-blur-lg" style={{ borderColor: isGold ? "rgba(224,165,54,0.2)" : "var(--hairline)" }}>
      {/* Growth toast — briefly ties the just-enabled item's hook to the price it just moved */}
      <AnimatePresence>
        {growthToast && (
          <motion.div
            key={growthToast.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="absolute left-1/2 -translate-x-1/2 -top-8 max-w-[92%] px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap overflow-hidden text-ellipsis shadow-lg"
            style={{ background: "var(--ember)", color: "#fff" }}
          >
            📈 {growthToast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Value anchor — subtle reframe above the estimate */}
      <div className="px-4 pt-2 pb-0">
        <p className="text-[7px] text-sand/15 leading-relaxed text-center max-w-md mx-auto">
          {VALUE_ANCHOR}
        </p>
      </div>

      {/* Tap to expand breakdown */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Founding Partner unlock progress ring */}
          <div className="relative w-8 h-8 shrink-0">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="13" fill="none"
                stroke={isGold ? "#E0A536" : "#E85D2A"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(totals.foundingPartnerProgress / 100) * 81.68} 81.68`}
                className="transition-all duration-500"
              />
            </svg>
            {isGold && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px]">🏆</span>
            )}
          </div>

          {/* Estimate labels */}
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-base font-bold text-gold tabular-nums">
                {CURRENCY}{displayTotal.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-sand/30 font-mono">
                est. {CURRENCY}{totals.estimateLow.toLocaleString("en-IN")}–{CURRENCY}{totals.estimateHigh.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-0.5 text-[8px] text-sand/40 italic">
              Most {state.businessType || "rental"} owners invest {formatPrice(TYPICAL_INVESTMENT_RANGE.low)}–{formatPrice(TYPICAL_INVESTMENT_RANGE.high)}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {isGold ? (
                <span className="text-[9px] text-gold font-semibold">
                  🏆 Founding Partner rate unlocked
                </span>
              ) : (
                <span className="text-[9px] text-sand/30">
                  {CURRENCY}{totals.foundingPartnerRemaining.toLocaleString("en-IN")} more unlocks your Founding Partner growth rate
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          className={cn("w-3.5 h-3.5 text-sand/30 transition-transform duration-200", expanded && "rotate-180")}
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-sand/40">
                <span>Base package</span>
                <span className="font-mono tabular-nums">{CURRENCY}{BASE_PRICE.toLocaleString("en-IN")}</span>
              </div>
              {totals.designTierPrice > 0 && (
                <div className="flex justify-between text-sand/40">
                  <span>Design tier</span>
                  <span className="font-mono tabular-nums">+{CURRENCY}{totals.designTierPrice.toLocaleString("en-IN")}</span>
                </div>
              )}
              {totals.featuresTotal > 0 && (
                <div className="flex justify-between text-sand/40">
                  <span>Features</span>
                  <span className="font-mono tabular-nums">+{CURRENCY}{totals.featuresTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              {state.aiVisibilityLevel > 0 && (
                <div className="flex justify-between text-sand/40">
                  <span>AI Visibility Launch</span>
                  <span className="font-mono tabular-nums">+{CURRENCY}{totals.aiVisibilityPrice.toLocaleString("en-IN")}</span>
                </div>
              )}
              {totals.extrasTotal > 0 && (
                <div className="flex justify-between text-sand/40">
                  <span>Extras</span>
                  <span className="font-mono tabular-nums">+{CURRENCY}{totals.extrasTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              {totals.scaleTotal > 0 && (
                <div className="flex justify-between text-sand/40">
                  <span>Scale add-ons</span>
                  <span className="font-mono tabular-nums">+{CURRENCY}{totals.scaleTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              {totals.timelineMultiplier > 1 && (
                <div className="flex justify-between text-sand/40">
                  <span>Fast-track (+15%)</span>
                  <span className="font-mono">Applied</span>
                </div>
              )}
              <div className="flex justify-between text-gold border-t border-hairline pt-2 mt-2">
                <span className="font-semibold">One-time total</span>
                <span className="font-mono font-bold tabular-nums">
                  {CURRENCY}{totals.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ───── 3-state send button ─────

// ───── Lock Scope Modal (Agreement & Send) ─────

function LockScopeModal({
  show,
  onClose,
  state,
  totals,
  dispatch,
  brandColors,
}: {
  show: boolean;
  onClose: () => void;
  state: CartState;
  totals: CartTotals;
  dispatch: React.Dispatch<CartAction>;
  brandColors: ReturnType<typeof resolveBrandColors>;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const bt = state.businessType;

  const handleSend = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/send-scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: bt,
          businessName: state.businessName,
          city: state.city,
          ownerName: state.ownerName,
          ownerPhone: state.ownerPhone,
          ownerEmail: state.ownerEmail,
          contactPreference: state.contactPreference,
          preferredDay: state.preferredDay,
          preferredSlot: state.preferredSlot,
          designTier: state.designTier,
          enabledFeatures: state.enabledFeatures,
          aiVisibilityLevel: state.aiVisibilityLevel,
          extras: state.extras,
          extraItems: state.extraItems,
          extraLocations: state.extraLocations,
          timeline: state.timeline,
          grandTotal: totals.grandTotal,
          estimateLow: totals.estimateLow,
          estimateHigh: totals.estimateHigh,
          phase1Total: totals.phase1Total,
          phase2Total: totals.phase2Total,
          rewardLabel: totals.reward?.label ?? null,
          rewardScope: totals.reward?.scope ?? null,
          avgBookingValue: state.avgBookingValue,
          extraBookingsPerMonth: state.extraBookingsPerMonth,
          carePlan: state.carePlan,
          carePlanBilling: state.carePlanBilling,
          brandPaletteName: brandColors.name,
          brandVibe: state.brand.vibe,
          brandFontPairing: FONT_PAIRINGS.find((f) => f.id === state.brand.fontPairing)?.name ?? "Modern",
          referredBusinessName: state.referredBusinessName,
          referredContact: state.referredContact,
          quoteId: state.quoteId,
          retainerOptIn: state.retainerOptIn,
          closeUpsells: state.closeUpsells,
        }),
      });
      if (!res.ok) throw new Error("API returned error");
      setStatus("sent");
      setTimeout(() => {
        onClose();
        dispatch({ type: "SET_WIZARD_STEP", step: "complete" });
      }, 600);
    } catch {
      // Fallback
      setStatus("idle");
      const subject = encodeURIComponent(`Rental Website Scope — ${state.businessName || "Your Business"}`);
      const body = encodeURIComponent(
        `RENTAL WEBSITE SCOPE — Rental Scope Studio\n\n` +
        `Business: ${state.businessName || "Your Business"}\n` +
        `Phase 1 Total: ${formatPrice(totals.phase1Total)}\n\n` +
        `Please open info@hayertechnologies.tech to finalize.`
      );
      window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
    }
  }, [status, state, totals, bt, brandColors.name, dispatch, onClose]);

  if (!show) return null;

  const m1 = Math.round(totals.phase1Total * 0.5);
  const m2 = Math.round(totals.phase1Total * 0.3);
  const m3 = totals.phase1Total - m1 - m2;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface border border-hairline rounded-2xl shadow-2xl relative"
      >
        <div className="sticky top-0 bg-surface/90 backdrop-blur flex items-center justify-between p-4 border-b border-hairline z-10">
          <div>
            <h2 className="font-display font-bold text-sand text-sm">Lock Your Scope</h2>
            <p className="text-[10px] text-sand/40 font-mono">Quote: {state.quoteId} • Valid for 7 days</p>
          </div>
          <button onClick={onClose} className="p-2 text-sand/40 hover:text-sand/80">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Milestones */}
          <div className="bg-pine/5 border border-pine/20 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-pine font-semibold mb-2">Phase 1 Milestones</p>
            <div className="flex justify-between items-center text-xs text-sand/60 mb-1">
              <span>50% to start</span>
              <span className="font-mono">{formatPrice(m1)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-sand/60 mb-1">
              <span>30% on design approval</span>
              <span className="font-mono">{formatPrice(m2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-sand/60">
              <span>20% at launch</span>
              <span className="font-mono">{formatPrice(m3)}</span>
            </div>
          </div>

          {/* Retainer Opt-in */}
          {totals.foundingPartnerUnlocked && (
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={state.retainerOptIn}
                    onChange={(e) => dispatch({ type: "SET_RETAINER_OPT_IN", value: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-gold/40 rounded bg-transparent peer-checked:bg-gold peer-checked:border-gold transition-all" />
                  <svg className="absolute w-3 h-3 text-ink opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gold">Start my Growth Plan after launch</p>
                  <p className="text-[10px] text-sand/50 mt-1">Lock my <strong>₹12,000/mo</strong> Founding Partner rate (save ₹72,000 in year one). Monthly SEO, 2 posts, reporting. Opt-in now, pay nothing until after launch.</p>
                </div>
              </label>
            </div>
          )}

          {/* Small Upsells */}
          <div>
            <p className="text-[10px] text-sand/40 uppercase tracking-wider mb-2 font-semibold">Pre-Launch Add-ons</p>
            <div className="space-y-2">
              {CLOSE_UPSELLS.map(u => {
                const checked = state.closeUpsells.includes(u.id);
                return (
                  <label key={u.id} className="flex items-center justify-between p-2 rounded-lg border border-hairline hover:border-sand/20 cursor-pointer transition-colors bg-surface/30">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={checked}
                          onChange={() => dispatch({ type: "TOGGLE_CLOSE_UPSELL", optionId: u.id })}
                          className="peer sr-only"
                        />
                        <div className="w-3.5 h-3.5 border border-sand/30 rounded-sm bg-transparent peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all" />
                        <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>
                      </div>
                      <span className="text-[11px] text-sand/60">{u.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-sand/40">+{formatPrice(u.price)}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={status !== "idle"}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-250 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: status === "sent" ? "var(--pine)" : "var(--gold)",
              color: "#0E1116",
            }}
          >
            {status === "idle" && (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5l8 5 8-5v10H2V5zm0-1h16L10 9 2 4z"/></svg>
                Finalize & Send
              </>
            )}
            {status === "sending" && (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round"/></svg>
                Locking…
              </>
            )}
            {status === "sent" && (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5l8 5 8-5v10H2V5zm0-1h16L10 9 2 4z"/></svg>
                ✓ Scope Locked
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ───── Welcome-back banner ─────

function WelcomeBackBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-gold/20 bg-gold/5 p-3 mb-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg">👋</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-sand truncate">
            Welcome back — your website is exactly where you left it
          </p>
          <p className="text-[9px] text-sand/30">Pick up where you stopped, or start fresh</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-[9px] text-sand/30 hover:text-sand/60 shrink-0 ml-3"
      >
        Dismiss
      </button>
    </motion.div>
  );
}

// ───── Smart defaults banner ─────

function SmartDefaultsBanner({
  businessType,
}: {
  businessType: BusinessType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-pine/20 bg-pine/5 p-3 mb-4"
    >
      <div className="flex items-start gap-2">
        <span className="text-pine text-sm mt-px">💡</span>
        <p className="text-[10px] text-sand/50 leading-relaxed">
          {SMART_DEFAULT_BANNER.replace("{type}", businessType)}
        </p>
      </div>
    </motion.div>
  );
}

// ───── Post-launch care plan card ─────

function CarePlanCard({
  plan,
  selected,
  billing,
  onSelect,
  onBillingToggle,
}: {
  plan: CarePlan;
  selected: boolean;
  billing: "monthly" | "annual";
  onSelect: () => void;
  onBillingToggle: () => void;
}) {
  // Plans with no annual prepay option (annualPrice <= 0) always render/behave as monthly,
  // regardless of the shared billing toggle state left over from another plan.
  const hasAnnualOption = plan.annualPrice > 0;
  const effectiveBilling = hasAnnualOption ? billing : "monthly";
  const perDay = getCarePlanPerDay(plan, effectiveBilling === "annual");
  const annualNote = getCarePlanAnnualNote(plan);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={plan.id !== "none" ? onSelect : undefined}
      className={cn(
        "relative w-full rounded-xl border p-4 text-left transition-all duration-250",
        selected
          ? plan.id === "none"
            ? "border-hairline bg-surface/50"
            : plan.id === "growth"
              ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(224,165,54,0.08)]"
              : "border-pine/30 bg-pine/5"
          : "border-hairline bg-surface/30 hover:border-sand/20"
      )}
    >
      {/* Most Popular badge */}
      {plan.badge && (
        <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-ink"
          style={{ background: "var(--gold)" }}>
          <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 5h5l-4 3 1.5 5L8 11l-4 3 1.5-5-4-3h5z"/></svg>
          {plan.badge}
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-display text-sm font-bold",
              selected ? "text-sand" : "text-sand/60"
            )}>
              {plan.label}
            </span>
          </div>
          {plan.description && (
            <p className="text-[9px] text-sand/40 mt-1 leading-relaxed">{plan.description}</p>
          )}
        </div>

        {/* Price display — hidden for "none" */}
        {plan.id !== "none" && (
          <div className="text-right shrink-0 ml-3">
            <div className={cn(
              "font-display text-base font-bold transition-colors",
              selected ? "text-gold" : "text-sand/40"
            )}>
              {effectiveBilling === "annual"
                ? `${formatPrice(plan.annualPrice)}/yr`
                : `${formatPrice(plan.monthlyPrice)}/mo`}
            </div>
            {perDay > 0 && (
              <div className="text-[8px] text-sand/20 mt-0.5">
                ≈ {formatPrice(perDay)}/day
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature bullets when selected */}
      {selected && plan.features.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-2 pt-2 space-y-1 overflow-hidden"
          style={{ borderTop: "1px solid var(--hairline)" }}
        >
          <span className="text-[8px] text-sand/30 font-mono uppercase tracking-wider">Included</span>
          <ul className="space-y-1 mt-1">
            {plan.features.map((f, i) => (
              <li key={i} className="text-[9px] text-sand/50 flex items-start gap-1.5">
                <span className="text-pine mt-px shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Agency comparison line */}
      {selected && plan.agencyLine && (
        <p className="text-[8px] text-sand/20 italic mt-2 leading-relaxed">
          {plan.agencyLine}
        </p>
      )}

      {/* Billing toggle — only for plans that actually offer annual prepay */}
      {selected && plan.id !== "none" && hasAnnualOption && (
        <button
          onClick={(e) => { e.stopPropagation(); onBillingToggle(); }}
          className="mt-2 flex items-center gap-2 text-[9px] text-sand/30 hover:text-sand/50 transition-colors"
        >
          <div className={cn(
            "w-7 h-3.5 rounded-full transition-colors relative",
            effectiveBilling === "annual" ? "bg-gold" : "bg-hairline"
          )}>
            <div className={cn(
              "w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-all",
              effectiveBilling === "annual" ? "left-[14px]" : "left-[2px]"
            )} />
          </div>
          {effectiveBilling === "annual" ? "Annual — get 2 months free" : "Monthly — no commitment"}
        </button>
      )}

      {/* Annual savings note */}
      {selected && effectiveBilling === "annual" && annualNote && (
        <p className="text-[8px] text-gold/60 mt-1">{annualNote}</p>
      )}

      {/* Monthly-only note for plans without annual prepay */}
      {selected && plan.id !== "none" && !hasAnnualOption && (
        <p className="text-[8px] text-sand/20 mt-2">Billed monthly — cancel anytime.</p>
      )}

      {/* Selection indicator */}
      {selected && plan.id !== "none" && (
        <div className={cn(
          "w-2 h-2 rounded-full mt-2",
          plan.id === "growth" ? "bg-gold" : "bg-pine"
        )} />
      )}
    </motion.div>
  );
}

// ───── Delivery / payment milestones strip ─────

function DeliveryStrip() {
  return (
    <div className="rounded-xl border border-pine/15 bg-pine/[0.03] p-3">
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-pine/10 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-3 h-3 text-pine" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1v7l4 2" />
            <circle cx="8" cy="8" r="7" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold text-pine mb-1">How we deliver</p>
          <p className="text-[8px] text-sand/40 leading-relaxed">{MILESTONE_PAYMENT_TEXT}</p>
        </div>
      </div>
    </div>
  );
}

// ───── Recent work proof card ─────

function RecentWorkCard() {
  return (
    <details className="group rounded-xl border border-hairline bg-surface/30 overflow-hidden">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0">🏗️</span>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-sand/60">Recent work</span>
            <p className="text-[8px] text-sand/20">See the kind of sites we ship</p>
          </div>
        </div>
        <svg className="w-3 h-3 text-sand/20 shrink-0 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
      </summary>
      <div className="px-4 pb-4 space-y-3">
        {RECENT_WORKS.map((work, i) => (
          <div key={i} className="rounded-lg border border-hairline bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold text-sand">{work.name}</span>
              <span className="text-[7px] text-sand/20 bg-white/[0.04] px-1.5 py-0.5 rounded-full">{work.description}</span>
            </div>
            <ul className="space-y-1">
              {work.outcomes.map((o, j) => (
                <li key={j} className="text-[8px] text-sand/40 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-pine shrink-0 mt-px">→</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

// ───── Founding Partner unlock banner ─────
// Shown when the one-time build crosses CARE_REWARD_TARGET. Not "free stuff" —
// a real, paid, discounted growth-partner rate. Framed as strongly recommended
// but optional; the build alone is always a complete, valid choice.

function FoundingPartnerBanner() {
  const savings = getFoundingPartnerSavings();
  return (
    <div
      className="rounded-xl border border-gold/30 p-4 mb-3"
      style={{ background: "linear-gradient(135deg, rgba(224,165,54,0.10), rgba(224,165,54,0.02))" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg shrink-0">🏆</span>
        <div className="min-w-0">
          <h4 className="font-display text-sm font-bold text-gold">Founding Partner Rate Unlocked</h4>
          <p className="text-[9px] text-sand/40 leading-relaxed">
            You crossed {formatPrice(CARE_REWARD_TARGET)} on your build — that unlocks our best {GROWTH_RETAINER.name} rate.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-ink/40 border border-gold/15 p-3 mb-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-display text-xl font-bold text-gold">
            {formatPrice(GROWTH_RETAINER.foundingPartnerMonthlyPrice)}/mo
          </span>
          <span className="text-[10px] text-sand/30 line-through">
            {formatPrice(GROWTH_RETAINER.standardMonthlyPrice)}/mo
          </span>
          <span className="text-[9px] text-sand/30">— locked {GROWTH_RETAINER.foundingPartnerLockMonths} months</span>
        </div>
        <p className="text-[9px] text-sand/45 mt-1.5 leading-relaxed">
          Your Founding Partner rate, normally {formatPrice(GROWTH_RETAINER.standardMonthlyPrice)}. You save{" "}
          <strong className="text-gold">{formatPrice(savings)}</strong> across your first {GROWTH_RETAINER.foundingPartnerLockMonths} months.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[8px] font-semibold text-gold bg-gold/10 px-2 py-1 rounded-full">🎁 First month free</span>
        <span className="text-[8px] font-semibold text-gold bg-gold/10 px-2 py-1 rounded-full">⚡ Priority support</span>
      </div>

      <p className="text-[8px] text-sand/25 leading-relaxed italic">
        Real, paid growth work at a real discounted rate — not free, not unlimited. Completely optional: take the build alone, or add {GROWTH_RETAINER.name} below.
      </p>
    </div>
  );
}

// ───── Guarantee line ─────

function GuaranteeLine() {
  return (
    <div className="rounded-xl border border-ember/10 bg-ember/[0.02] p-3">
      <div className="flex items-start gap-2">
        <span className="text-sm shrink-0 mt-0.5">🛡️</span>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold text-sand/70 mb-1">Our guarantee to you</p>
          <p className="text-[8px] text-sand/40 leading-relaxed">{GUARANTEE_LINE}</p>
        </div>
      </div>
    </div>
  );
}

// ───── Main panel ─────

export function ControlsPanel() {
  const { state, dispatch, totals } = useCart();
  const bt = state.businessType as BusinessType;
  const labels = getLabels(bt);
  const visibleFeatures = getVisibleFeatures(bt);
  const popularFeatures = bt ? (POPULAR_WITH[bt] ?? []) : [];
  const brandColors = resolveBrandColors(state.brand);
  const brandTheme = getBrandTheme(state.brand);
  const [showLockModal, setShowLockModal] = useState(false);

  // ── Growth toast — briefly surfaces a just-enabled feature/tier's hook near the live estimate ──
  const [growthToast, setGrowthToast] = useState<{ text: string; key: number } | null>(null);
  const growthToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announceGrowth = useCallback((text: string) => {
    if (growthToastTimer.current) clearTimeout(growthToastTimer.current);
    setGrowthToast({ text, key: Date.now() });
    growthToastTimer.current = setTimeout(() => setGrowthToast(null), 4200);
  }, []);
  useEffect(() => {
    return () => { if (growthToastTimer.current) clearTimeout(growthToastTimer.current); };
  }, []);

  // ── Step navigation ──
  const step = state.wizardStep;

  const goToStep = useCallback((s: WizardStepId) => {
    dispatch({ type: "SET_WIZARD_STEP", step: s });
    document.getElementById("controls-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  // Apply smart defaults when entering the features step
  useEffect(() => {
    if (step === "features" && bt && !state.smartDefaultsApplied) {
      dispatch({ type: "APPLY_SMART_DEFAULTS" });
    }
  }, [step, bt, state.smartDefaultsApplied, dispatch]);

  const navSteps = WIZARD_STEPS.filter((s) => s.id !== "businessType");

  const sections: Record<string, { label: string; content: React.ReactNode }> = {
    identity: {
      label: "Your business",
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-hairline bg-surface/50 p-4">
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-1.5 uppercase">
              Business name
            </label>
            <input
              type="text"
              value={state.businessName}
              onChange={(e) => dispatch({ type: "SET_BUSINESS_NAME", name: e.target.value })}
              placeholder={`e.g. Goa ${labels.items.replace(/^./, (c) => c.toUpperCase())} Rentals`}
              className="w-full bg-transparent border-b border-hairline pb-1.5 text-sm text-sand placeholder:text-sand/20 outline-none focus:border-ember/50 transition-colors"
            />
          </div>
          <div className="rounded-xl border border-hairline bg-surface/50 p-4">
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-1.5 uppercase">
              City / area
            </label>
            <input
              type="text"
              value={state.city}
              onChange={(e) => dispatch({ type: "SET_CITY", city: e.target.value })}
              placeholder="e.g. Delhi, Goa, Bengaluru"
              className="w-full bg-transparent border-b border-hairline pb-1.5 text-sm text-sand placeholder:text-sand/20 outline-none focus:border-ember/50 transition-colors"
            />
          </div>
          <div className="rounded-xl border border-hairline bg-surface/50 p-4">
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-1.5 uppercase">
              Your name
            </label>
            <input
              type="text"
              value={state.ownerName}
              onChange={(e) => dispatch({ type: "SET_OWNER_NAME", name: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              className="w-full bg-transparent border-b border-hairline pb-1.5 text-sm text-sand placeholder:text-sand/20 outline-none focus:border-ember/50 transition-colors"
            />
          </div>
          <div className="rounded-xl border border-hairline bg-surface/50 p-4">
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-1.5 uppercase">
              Phone number
            </label>
            <input
              type="tel"
              value={state.ownerPhone}
              onChange={(e) => dispatch({ type: "SET_OWNER_PHONE", phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full bg-transparent border-b border-hairline pb-1.5 text-sm text-sand placeholder:text-sand/20 outline-none focus:border-ember/50 transition-colors"
            />
          </div>
          <div className="rounded-xl border border-hairline bg-surface/50 p-4">
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-1.5 uppercase">
              Email address
            </label>
            <input
              type="email"
              value={state.ownerEmail}
              onChange={(e) => dispatch({ type: "SET_OWNER_EMAIL", email: e.target.value })}
              placeholder="you@example.com"
              className="w-full bg-transparent border-b border-hairline pb-1.5 text-sm text-sand placeholder:text-sand/20 outline-none focus:border-ember/50 transition-colors"
            />
          </div>
          <div className="rounded-xl border border-hairline bg-surface/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-sand/30 font-mono tracking-wider uppercase">
                Google rating
              </label>
              <span className="text-sm font-bold text-gold">
                {state.googleRating > 0 ? `${state.googleRating}.0★` : "—"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              value={state.googleRating}
              onChange={(e) => dispatch({ type: "SET_GOOGLE_RATING", rating: Number(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #E0A536 0%, #E0A536 ${(state.googleRating / 5) * 100}%, rgba(255,255,255,0.08) ${(state.googleRating / 5) * 100}%, rgba(255,255,255,0.08) 100%)`,
              }}
            />
            <div className="flex justify-between text-[9px] text-sand/20 mt-1">
              <span>Off</span>
              <span>5★</span>
            </div>
          </div>
        </div>
      ),
    },
    brand: {
      label: "Make it yours",
      content: (
        <div className="space-y-4">
          {/* Free — ownership hook */}
          <div className="rounded-xl border border-ember/20 bg-ember/5 p-4 text-center">
            <span className="inline-block text-[9px] font-mono font-semibold tracking-wider uppercase text-pine bg-pine/10 px-2 py-0.5 rounded-full mb-2">
              Free — no impact on price
            </span>
            <p className="text-xs text-sand/70 leading-relaxed">
              This is <strong className="text-sand">YOUR</strong> site. Pick your colours and watch it come alive.
            </p>
          </div>

          {/* Colour theme presets */}
          <div>
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-2 uppercase">
              Colour theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BRAND_PRESETS.map((preset) => (
                <BrandPresetSwatch
                  key={preset.id}
                  preset={preset}
                  selected={state.brand.themeId === preset.id}
                  onSelect={() => dispatch({ type: "SET_BRAND_THEME", themeId: preset.id })}
                />
              ))}
            </div>
            <button
              onClick={() => dispatch({ type: "SET_BRAND_THEME", themeId: "custom" })}
              className={cn(
                "mt-2 w-full flex items-center gap-3 rounded-xl border p-3 transition-all duration-250 text-left",
                state.brand.themeId === "custom" ? "border-ember bg-ember/5" : "border-hairline bg-surface/50 hover:border-sand/20"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full border border-white/10" style={{ background: state.brand.customPrimary }} />
                <span className="w-6 h-6 rounded-full border border-white/10 -ml-3" style={{ background: state.brand.customAccent }} />
              </div>
              <span className={cn("text-xs font-semibold", state.brand.themeId === "custom" ? "text-sand" : "text-sand/60")}>
                Custom colours
              </span>
            </button>

            {state.brand.themeId === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 grid grid-cols-2 gap-2 overflow-hidden"
              >
                <label className="flex items-center justify-between rounded-lg border border-hairline bg-surface/50 px-3 py-2.5 cursor-pointer">
                  <span className="text-[10px] text-sand/50">Primary</span>
                  <input
                    type="color"
                    value={state.brand.customPrimary}
                    onChange={(e) => dispatch({ type: "SET_BRAND_CUSTOM_COLOR", channel: "primary", color: e.target.value })}
                    className="w-7 h-7 rounded-md border-none bg-transparent cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-hairline bg-surface/50 px-3 py-2.5 cursor-pointer">
                  <span className="text-[10px] text-sand/50">Accent</span>
                  <input
                    type="color"
                    value={state.brand.customAccent}
                    onChange={(e) => dispatch({ type: "SET_BRAND_CUSTOM_COLOR", channel: "accent", color: e.target.value })}
                    className="w-7 h-7 rounded-md border-none bg-transparent cursor-pointer"
                  />
                </label>
              </motion.div>
            )}
          </div>

          {/* Logo upload */}
          <LogoUploadField
            logoDataUrl={state.brand.logoDataUrl}
            businessName={state.businessName}
            onUpload={(dataUrl) => dispatch({ type: "SET_BRAND_LOGO", dataUrl })}
            onRemove={() => dispatch({ type: "SET_BRAND_LOGO", dataUrl: null })}
          />

          {/* Vibe: light / dark */}
          <div>
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-2 uppercase">
              Site vibe
            </label>
            <VibeToggle
              vibe={state.brand.vibe}
              onChange={(vibe) => dispatch({ type: "SET_BRAND_VIBE", vibe })}
            />
          </div>

          {/* Font pairing */}
          <div>
            <label className="block text-[10px] text-sand/30 font-mono tracking-wider mb-2 uppercase">
              Font pairing
            </label>
            <div className="space-y-2">
              {FONT_PAIRINGS.map((pairing) => (
                <FontPairingOption
                  key={pairing.id}
                  pairing={pairing}
                  selected={state.brand.fontPairing === pairing.id}
                  onSelect={() => dispatch({ type: "SET_BRAND_FONT_PAIRING", pairing: pairing.id })}
                />
              ))}
            </div>
          </div>

          <p className="text-[9px] text-sand/20 text-center leading-relaxed">
            Watch the live preview on the right update instantly — every choice here carries through to your final site, PDF, and emailed scope.
          </p>
        </div>
      ),
    },
    inventory: {
      label: "Inventory & scale",
      content: (
        <div className="space-y-3">
          <p className="text-[10px] text-sand/40 leading-relaxed">
            Your base package includes 8 {labels.items} and 1 delivery location. Scale up as your business grows.
          </p>
          <ScaleSlider
            label={`Extra ${labels.items} (beyond 8)`}
            value={state.extraItems}
            min={MIN_INVENTORY}
            max={MAX_INVENTORY}
            pricePerUnit={EXTRA_ITEM_PRICE}
            onChange={(v) => dispatch({ type: "SET_EXTRA_ITEMS", count: v })}
          />
          <ScaleSlider
            label="Extra pickup/delivery locations (beyond 1)"
            value={state.extraLocations}
            min={MIN_LOCATIONS}
            max={MAX_LOCATIONS}
            pricePerUnit={EXTRA_LOCATION_PRICE}
            onChange={(v) => dispatch({ type: "SET_EXTRA_LOCATIONS", count: v })}
          />
        </div>
      ),
    },
    features: {
      label: "Core features",
      content: (
        <div>
          {bt && !state.smartDefaultsApplied && <SmartDefaultsBanner businessType={bt} />}
          <p className="text-[10px] text-sand/40 leading-relaxed mb-4">
            Each feature is an investment in your business. Toggle anything on or off — your total updates instantly.
          </p>
          <div className="space-y-2">
            {visibleFeatures.map((feature) => {
              const enabled = state.enabledFeatures.includes(feature.id);
              const isPopular = popularFeatures.includes(feature.id);
              return (
                <FeatureToggle
                  key={feature.id}
                  feature={feature}
                  enabled={enabled}
                  businessType={bt}
                  isPopular={isPopular}
                  payoffChip={formatPaybackChip(feature.price, state.avgBookingValue, state.extraBookingsPerMonth)}
                  onToggle={() => {
                    const turningOn = !enabled;
                    dispatch({ type: "TOGGLE_FEATURE", featureId: feature.id });
                    if (turningOn) announceGrowth(feature.hook);
                  }}
                />
              );
            })}
          </div>
        </div>
      ),
    },
    design: {
      label: "Design tier",
      content: (
        <div>
          <p className="text-[10px] text-sand/40 leading-relaxed mb-4">
            Your design tier determines how your site feels. Upgrade for motion, 3D, and immersive brand experiences.
          </p>
          <div className="space-y-2">
            {DESIGN_TIERS.map((tier) => (
              <DesignTierCard
                key={tier.id}
                tier={tier}
                selected={state.designTier === tier.id}
                payoffChip={formatPaybackChip(tier.price, state.avgBookingValue, state.extraBookingsPerMonth)}
                onSelect={() => {
                  const turningOn = state.designTier !== tier.id && tier.price > 0;
                  dispatch({ type: "SET_DESIGN_TIER", tier: tier.id });
                  if (turningOn) announceGrowth(tier.hook);
                }}
              />
            ))}
          </div>
        </div>
      ),
    },
    seo: {
      label: "AI Visibility",
      content: (
        <div>
          {/* Step intro panel */}
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 mb-4">
            <div className="flex items-center gap-1.5 text-[8px] text-gold font-mono uppercase tracking-wider mb-2">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 5h5l-4 3 1.5 5L8 11l-4 3 1.5-5-4-3h5z"/></svg>
              Flagship product
            </div>
            <h4 className="font-display text-base font-semibold text-sand mb-2">🚀 AI Visibility Launch</h4>
            <p className="text-[10px] text-sand/40 leading-relaxed mb-3">
              Get found by Google AND AI. One-time project, fixed scope, no monthly commitment. Pick the level that matches your ambition — you own every change forever.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm">🔍</span>
              <span className="text-[9px] text-sand/30">Google Search</span>
              <span className="text-sand/10">·</span>
              <span className="text-sm">🤖</span>
              <span className="text-[9px] text-sand/30">AI Overview & ChatGPT</span>
              <span className="text-sand/10">·</span>
              <span className="text-sm">💬</span>
              <span className="text-[9px] text-sand/30">Gemini & Perplexity</span>
            </div>
          </div>

          <p className="text-[10px] text-sand/30 italic mb-4 leading-relaxed">
            {AGENCY_COMPARISON_LINE}
          </p>

          <div className="space-y-2">
            {AI_VISIBILITY_TIERS.map((tier) => (
              <AiVisibilityCard
                key={tier.id}
                tier={tier}
                selected={state.aiVisibilityLevel === tier.id}
                onSelect={() => {
                  const turningOn = state.aiVisibilityLevel !== tier.id;
                  dispatch({
                    type: "SET_AI_VISIBILITY_LEVEL",
                    level: turningOn ? tier.id as AiVisibilityLevel : 0,
                  });
                  if (turningOn) announceGrowth(tier.tagline);
                }}
              />
            ))}
          </div>

          {/* AI Visibility ROI mini-calculator — shown when a tier is selected */}
          {state.aiVisibilityLevel > 0 && (() => {
            const selectedTier = AI_VISIBILITY_TIERS.find((t) => t.id === state.aiVisibilityLevel as 1 | 2 | 3);
            return selectedTier ? (
              <AiVisibilityROI
                tierPrice={selectedTier.price}
                businessType={bt}
                defaultBookingValue={state.avgBookingValue}
              />
            ) : null;
          })()}
        </div>
      ),
    },
    extras: {
      label: "Extra services",
      content: (
        <div>
          <p className="text-[10px] text-sand/40 leading-relaxed mb-4">
            One-time add-ons to launch faster and look professional from day one.
          </p>
          <div className="space-y-1.5">
            {EXTRA_OPTIONS.map((opt) => (
              <ExtraToggle
                key={opt.id}
                option={opt}
                selected={state.extras.includes(opt.id)}
                onToggle={() => dispatch({ type: "TOGGLE_EXTRA", optionId: opt.id })}
              />
            ))}
          </div>
        </div>
      ),
    },
    timeline: {
      label: "Timeline",
      content: (
        <div>
          <p className="text-[10px] text-sand/40 leading-relaxed mb-4">
            How soon do you need your site live?
          </p>
          <div className="flex gap-3">
            {TIMELINE_OPTIONS.map((opt) => (
              <TimelineCard
                key={opt.id}
                option={opt}
                selected={state.timeline === opt.id}
                onSelect={() => dispatch({ type: "SET_TIMELINE", timeline: opt.id })}
              />
            ))}
          </div>
        </div>
      ),
    },
    meeting: {
      label: "Schedule a call",
      content: (
        <div className="space-y-4">
          <SectionHeader
            title="When should we discuss building this?"
            subtitle="Pick your preferred day and time — we'll confirm within the hour"
          />

          {/* Day selection */}
          <div>
            <p className="text-[10px] text-sand/30 font-mono tracking-wider uppercase mb-2">Day preference</p>
            <div className="flex gap-2">
              {DAY_OPTIONS.map((d) => (
                <motion.button
                  key={d.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => dispatch({ type: "SET_PREFERRED_DAY", day: state.preferredDay === d.id ? null : d.id })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-3 text-center transition-all duration-250",
                    state.preferredDay === d.id
                      ? "border-ember/40 bg-ember/10"
                      : "border-hairline bg-surface/30 hover:border-sand/20",
                  )}
                >
                  <span className={cn(
                    "text-sm font-display font-semibold",
                    state.preferredDay === d.id ? "text-ember" : "text-sand/60",
                  )}>
                    {d.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Time slot selection */}
          <div>
            <p className="text-[10px] text-sand/30 font-mono tracking-wider uppercase mb-2">Time slot</p>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((s) => (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => dispatch({ type: "SET_PREFERRED_SLOT", slot: state.preferredSlot === s.id ? null : s.id })}
                  className={cn(
                    "rounded-lg border px-2 py-2.5 text-center transition-all duration-250",
                    state.preferredSlot === s.id
                      ? "border-ember/40 bg-ember/10"
                      : "border-hairline bg-surface/30 hover:border-sand/20",
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-semibold",
                    state.preferredSlot === s.id ? "text-ember" : "text-sand/50",
                  )}>
                    {s.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Call now CTA */}
          <a
            href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(`Hi! I just configured my rental website scope on Rental Scope Studio and I'd like to discuss it right away.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-pine/30 bg-pine/5 py-2.5 text-xs font-semibold text-pine hover:bg-pine/10 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Call me now on WhatsApp
          </a>

          {/* Contact preference */}
          <div>
            <p className="text-[10px] text-sand/30 font-mono tracking-wider uppercase mb-2">How should we reach you?</p>
            <div className="flex flex-wrap gap-2">
              {CONTACT_PREFERENCES.map((p) => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => dispatch({ type: "SET_CONTACT_PREFERENCE", preference: state.contactPreference === p.id ? null : p.id })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-[10px] font-medium transition-all duration-250",
                    state.contactPreference === p.id
                      ? "border-ember/40 bg-ember/10 text-ember"
                      : "border-hairline bg-surface/30 text-sand/50 hover:border-sand/20 hover:text-sand/70",
                  )}
                >
                  {p.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    results: {
      label: "Your website scope",
      content: (
        <div className="space-y-5">
          {/* ─── HEADER ─── */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-pine bg-pine/10 px-3 py-1 rounded-full mb-2">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6"/></svg>
              Scope complete
            </div>
            <h3 className="font-display text-base font-bold text-sand">
              Your website is ready
            </h3>
            <p className="text-[10px] text-sand/30 mt-1">
              Prepared for <strong className="text-sand/70">{state.ownerName || state.businessName || "you"}</strong>
              {state.businessName ? ` — ${state.businessName}` : ""}
              {state.city ? `, ${state.city}` : ""}
            </p>
            <p className="text-[7px] text-sand/15 mt-2 leading-relaxed max-w-xs mx-auto">
              {VALUE_ANCHOR}
            </p>
          </div>

          {/* ─── SUBTLE TRUST STRIP ─── */}
          <div className="flex flex-col items-center justify-center gap-1.5 opacity-80 mb-2">
            <div className="flex items-center gap-0.5 text-gold">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[8px] text-sand/40 tracking-wide">
              Built by the studio behind dencitydentalcare.in · Trusted by {TRUSTED_BUSINESS_COUNT} local businesses
            </p>
          </div>

          {/* ─── FINAL PREVIEW SHOT — reflects your chosen brand colours, logo, vibe & fonts ─── */}
          <div
            className="brand-live rounded-xl overflow-hidden border"
            style={{ borderColor: "var(--hairline)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2 border-b"
              style={{ borderColor: "var(--hairline)", background: brandTheme["--bg"] }}
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[8px] font-mono ml-1" style={{ color: hexToRgbaString(brandTheme["--sand"], 0.4) }}>
                {state.businessName ? `${state.businessName.toLowerCase().replace(/\s+/g, "")}.com` : "your-site.com"}
              </span>
            </div>
            {/* Mini site preview */}
            <div style={{ background: brandTheme["--bg"] }}>
              {/* Mini hero */}
              <div className="px-4 py-6 text-center" style={{ background: `radial-gradient(ellipse at 50% 30%, ${hexToRgbaString(brandColors.primary, 0.08)}, transparent 60%)` }}>
                {state.brand.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={state.brand.logoDataUrl} alt="Logo" className="h-8 mx-auto mb-2 object-contain" />
                ) : (
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center" style={{ background: hexToRgbaString(brandColors.primary, 0.12) }}>
                    <svg className="w-4 h-4" style={{ color: brandColors.primary }} viewBox="0 0 16 16" fill="currentColor">
                      {state.businessType === "bikes" ? <path d="M7 2l1 2h4l1-2 2 1-1 2H6L5 3zM4 6h12v1H4zM5 7l1 7h8l1-7H5zm1 8a1 1 0 110 2 1 1 0 010-2zm8 0a1 1 0 110 2 1 1 0 010-2z"/> :
                       state.businessType === "cars" ? <path d="M3 7l1-3h10l1 3v6h-1a1.5 1.5 0 01-3 0H7a1.5 1.5 0 01-3 0H3V7zm2 1h2v2H5V8zm6 0h2v2h-2V8z"/> :
                       <path d="M3 5a2 2 0 012-2h6l4 4v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 2h4a1 1 0 110 2H7a1 1 0 110-2z"/>}
                    </svg>
                  </div>
                )}
                <h4 className="text-xs font-semibold" style={{ color: brandTheme["--sand"], fontFamily: brandTheme["--font-display"] }}>
                  {state.businessName || "Your Business"}
                </h4>
                {state.city && (
                  <p className="text-[8px] mt-0.5" style={{ color: hexToRgbaString(brandTheme["--sand"], 0.4) }}>
                    {state.city} · Premium {labels.items}
                  </p>
                )}
                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {state.enabledFeatures.length > 0 && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: hexToRgbaString(brandTheme["--sand"], 0.08), color: hexToRgbaString(brandTheme["--sand"], 0.5) }}>
                      {state.enabledFeatures.length} features
                    </span>
                  )}
                  {state.designTier !== "standard" && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: hexToRgbaString(brandTheme["--sand"], 0.08), color: hexToRgbaString(brandTheme["--sand"], 0.5) }}>
                      {DESIGN_TIERS.find((t) => t.id === state.designTier)?.label}
                    </span>
                  )}
                  {totals.reward && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(224,165,54,0.1)", color: "#E0A536" }}>
                      🏆 Reward active
                    </span>
                  )}
                </div>
              </div>
              {/* Mini stats */}
              <div className="flex border-t" style={{ borderColor: brandTheme["--hairline"] }}>
                {[
                  { label: labels.items, value: `${8 + state.extraItems}` },
                  { label: "Features", value: `${state.enabledFeatures.length}` },
                  { label: "Pages", value: "3+" },
                ].map((s) => (
                  <div key={s.label} className="flex-1 text-center py-2" style={{ borderRight: `1px solid ${brandTheme["--hairline"]}` }}>
                    <div className="text-[11px] font-bold" style={{ color: brandTheme["--sand"] }}>{s.value}</div>
                    <div className="text-[7px]" style={{ color: hexToRgbaString(brandTheme["--sand"], 0.3) }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── POSITIONING CARD: WHY WE'RE NOT THE CHEAPEST ─── */}
          <div className="rounded-xl border border-hairline bg-surface/30 p-4">
            <h4 className="font-display text-xs font-bold text-sand mb-3">Why we&apos;re not the cheapest — and why that&apos;s good for you</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-pine text-xs shrink-0 mt-px">✓</span>
                <p className="text-[9px] text-sand/60 leading-relaxed">
                  Cheap template sites typically get abandoned and rebuilt within a year. You end up paying twice.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pine text-xs shrink-0 mt-px">✓</span>
                <p className="text-[9px] text-sand/60 leading-relaxed">
                  Real booking and local SEO systems require serious engineering, not a weekend plugin.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pine text-xs shrink-0 mt-px">✓</span>
                <p className="text-[9px] text-sand/60 leading-relaxed">
                  You get a committed studio owner who actually answers the phone, not a disappearing freelancer.
                </p>
              </li>
            </ul>
          </div>

          {/* ─── ITEMIZED SCOPE ─── */}
          <div className="rounded-xl border border-hairline bg-surface/30 p-4">
            <h4 className="font-display text-xs font-bold text-sand mb-3">Full scope breakdown</h4>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-sand/40">Base package</span>
                <span className="font-mono text-sand/60">{formatPrice(BASE_PRICE)}</span>
              </div>
              <details className="group">
                <summary className="text-[8px] text-sand/20 cursor-pointer hover:text-sand/40 transition-colors list-none flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                  What&apos;s included
                </summary>
                <ul className="mt-1 space-y-0.5 pl-3">
                  {BASE_INCLUDES.map((item) => (
                    <li key={item} className="text-[8px] text-sand/30 flex items-center gap-1">
                      <span className="text-pine">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </details>
              {totals.designTierPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-sand/40">Design: {DESIGN_TIERS.find((t) => t.id === state.designTier)?.label}</span>
                  <span className="font-mono text-sand/60">+{formatPrice(totals.designTierPrice)}</span>
                </div>
              )}
              {state.enabledFeatures.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-sand/40 font-semibold">{state.enabledFeatures.length} Core Features</span>
                  <div className="pl-2 border-l border-hairline space-y-1.5">
                    {state.enabledFeatures.map(fid => {
                      const f = FEATURES.find(x => x.id === fid)!;
                      const isP2 = state.phase2Features.includes(fid);
                      return (
                        <div key={fid} className="flex justify-between items-center group">
                          <span className={cn("text-[9px] transition-colors max-w-[65%]", isP2 ? "text-sand/20 line-through" : "text-sand/40")}>{f.label}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => dispatch({ type: "TOGGLE_PHASE2_FEATURE", featureId: fid })}
                              className="opacity-0 group-hover:opacity-100 text-[8px] text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20 rounded px-1.5 py-0.5 whitespace-nowrap"
                            >
                              {isP2 ? "Move to Phase 1" : "Move to Phase 2"}
                            </button>
                            <span className={cn("font-mono text-[9px]", isP2 ? "text-sand/20 line-through" : "text-sand/60")}>+{formatPrice(f.price)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {state.aiVisibilityLevel > 0 && (() => {
                const aiTier = AI_VISIBILITY_TIERS.find((t) => t.id === state.aiVisibilityLevel as 1 | 2 | 3);
                return (
                  <div className="flex justify-between pt-1">
                    <span className="text-sand/40 font-semibold">AI Visibility: {aiTier?.icon} {aiTier?.label}</span>
                    <span className="font-mono text-sand/60">+{formatPrice(totals.aiVisibilityPrice)}</span>
                  </div>
                );
              })()}
              {state.extras.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-sand/40 font-semibold">Extra Services</span>
                  <div className="pl-2 border-l border-hairline space-y-1.5">
                    {state.extras.map(id => {
                      const e = EXTRA_OPTIONS.find(x => x.id === id)!;
                      const isP2 = state.phase2Extras.includes(id);
                      return (
                        <div key={id} className="flex justify-between items-center group">
                          <span className={cn("text-[9px] transition-colors max-w-[65%]", isP2 ? "text-sand/20 line-through" : "text-sand/40")}>{e.label}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => dispatch({ type: "TOGGLE_PHASE2_EXTRA", optionId: id })}
                              className="opacity-0 group-hover:opacity-100 text-[8px] text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20 rounded px-1.5 py-0.5 whitespace-nowrap"
                            >
                              {isP2 ? "Move to Phase 1" : "Move to Phase 2"}
                            </button>
                            <span className={cn("font-mono text-[9px]", isP2 ? "text-sand/20 line-through" : "text-sand/60")}>+{formatPrice(e.price)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {totals.scaleTotal > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-sand/40">Scale add-ons (items × locations)</span>
                  <span className="font-mono text-sand/60">+{formatPrice(totals.scaleTotal)}</span>
                </div>
              )}
              {totals.timelineMultiplier > 1 && (
                <div className="flex justify-between pt-1">
                  <span className="text-sand/40">Fast-track (+15%)</span>
                  <span className="font-mono text-sand/60">Applied</span>
                </div>
              )}

              {/* Rewards & Unlocks */}
              {totals.reward && (
                <div className="mt-2 pt-2 border-t border-hairline">
                  <div className="flex items-center gap-1.5">
                    <span className="text-pine">🎁</span>
                    <span className="text-[10px] font-semibold text-pine">
                      {totals.reward.label}
                    </span>
                  </div>
                  <p className="text-[8px] text-sand/30 mt-0.5">{totals.reward.scope}</p>
                </div>
              )}
              {totals.foundingPartnerUnlocked && (
                <div className="mt-2 pt-2 border-t border-hairline">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gold">🏆</span>
                    <span className="text-[10px] font-semibold text-gold">
                      Founding Partner Rate Unlocked
                    </span>
                  </div>
                  <p className="text-[8px] text-sand/30 mt-0.5">
                    You&apos;ve unlocked our best rate. See below.
                  </p>
                </div>
              )}

              {/* Value Stack & Splitter */}
              <div className="mt-4 pt-3 border-t border-hairline flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-sand/30">Total Value Stack</span>
                  <span className="font-display text-sm font-bold text-sand/40 line-through decoration-sand/20">
                    {formatPrice(totals.grandTotal)}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 bg-surface/80 rounded-xl p-3 border border-hairline shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-display font-bold text-sand">Phase 1: Build & Launch</span>
                    <span className="font-display text-lg font-bold" style={{ color: totals.phase1Total >= CARE_REWARD_TARGET ? "var(--gold)" : "var(--ember)" }}>
                      {formatPrice(totals.phase1Total)}
                    </span>
                  </div>
                </div>
                
                {totals.phase2Total > 0 && (
                  <div className="flex items-center justify-between px-2 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                    <span className="text-[10px] text-blue-400 font-medium">Phase 2: Add in 3 months (Price locked for 6 mos)</span>
                    <span className="font-mono text-[10px] font-bold text-blue-400">
                      {formatPrice(totals.phase2Total)}
                    </span>
                  </div>
                )}
                
                <div className="mt-1 text-[9px] text-center text-pine font-medium bg-pine/10 rounded-md py-1.5 border border-pine/20">
                  50% to start · 30% on design approval · 20% at launch — you never pay for work you haven&apos;t seen.
                </div>
              </div>
              <p className="text-[8px] text-sand/20 text-right mt-1">
                Est. range {formatPrice(totals.estimateLow)}–{formatPrice(totals.estimateHigh)}
              </p>
            </div>
          </div>

          {/* ─── TIER MAPPING CARDS ─── */}
          <div>
            <p className="text-[10px] text-sand/30 font-mono tracking-wider uppercase mb-3">How your build compares</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "premium", label: "Premium", price: 65000, desc: "Enterprise-grade with rewards", color: "var(--gold)", active: totals.phase1Total >= 65000 },
                { id: "standard", label: "Standard", price: 40000, desc: "Full-featured business site", color: "var(--ember)", active: totals.phase1Total > 25000 && totals.phase1Total < 65000 },
                { id: "essential", label: "Essential", price: 18000, desc: "Core online presence", color: "var(--pine)", active: totals.phase1Total <= 25000 },
              ].map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    "rounded-lg border p-2.5 text-center transition-all duration-300",
                    tier.active ? "border-opacity-40 scale-105 z-10 shadow-lg bg-surface/80" : "border-hairline opacity-50 hover:opacity-80",
                    tier.id === "standard" && !tier.active ? "bg-surface/30" : ""
                  )}
                  style={{
                    borderColor: tier.active ? tier.color : undefined,
                    background: tier.active ? `${tier.color}15` : undefined,
                    boxShadow: tier.active ? `0 4px 20px -5px ${tier.color}30` : undefined,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mx-auto mb-1"
                    style={{ background: tier.color }}
                  />
                  <div className="text-[10px] font-display font-bold" style={{ color: tier.active ? tier.color : "var(--sand)" }}>
                    {tier.label}
                  </div>
                  <div className="text-[8px] text-sand/40 mt-0.5">{tier.price > totals.phase1Total ? `Up to ${formatPrice(tier.price)}` : `${formatPrice(tier.price)}+`}</div>
                  <div className="text-[7px] text-sand/30 mt-0.5">{tier.desc}</div>
                  {tier.active && (
                    <div className="text-[7px] font-semibold mt-1.5" style={{ color: tier.color }}>
                      ← Your build
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[8px] text-sand/20 text-center mt-2">
              Most {bt} businesses serious about growth choose Standard or Premium
            </p>
          </div>

          {/* ─── ROI REFRAME ─── */}
          <div className="rounded-xl border border-pine/20 bg-pine/5 p-4">
            <h4 className="font-display text-xs font-bold text-pine mb-2">ROI reframe</h4>
            <p className="text-[8px] text-sand/30 mb-3 leading-relaxed">
              How fast does your website pay for itself? Enter your numbers below.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-[8px] text-sand/30 font-mono tracking-wider mb-1 uppercase">
                  Avg. booking value (₹)
                </label>
                <input
                  type="number"
                  value={state.avgBookingValue || ""}
                  onChange={(e) => dispatch({ type: "SET_AVG_BOOKING_VALUE", value: Number(e.target.value) })}
                  className="w-full bg-surface/50 border border-hairline rounded-lg px-2.5 py-2 text-xs text-sand font-mono outline-none focus:border-pine/50 transition-colors"
                  placeholder="1200"
                />
              </div>
              <div>
                <label className="block text-[8px] text-sand/30 font-mono tracking-wider mb-1 uppercase">
                  Extra bookings/month
                </label>
                <input
                  type="number"
                  value={state.extraBookingsPerMonth || ""}
                  onChange={(e) => dispatch({ type: "SET_EXTRA_BOOKINGS_PER_MONTH", value: Number(e.target.value) })}
                  className="w-full bg-surface/50 border border-hairline rounded-lg px-2.5 py-2 text-xs text-sand font-mono outline-none focus:border-pine/50 transition-colors"
                  placeholder="10"
                />
              </div>
            </div>
            {(() => {
              const paybackWeeks = computePaybackWeeks(
                totals.grandTotal,
                state.avgBookingValue || 1200,
                state.extraBookingsPerMonth || 10,
              );
              const monthlyRevenue = (state.avgBookingValue || 1200) * (state.extraBookingsPerMonth || 10);
              const singleBookingRatio = (state.avgBookingValue || 1200) > 0
                ? Math.round(totals.grandTotal / (state.avgBookingValue || 1200))
                : Infinity;
              return (
                <div className="space-y-1">
                  {paybackWeeks < Infinity && paybackWeeks > 0 ? (
                    <div className="flex items-center gap-2 text-[10px] text-pine font-semibold">
                      <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 4.5L7 10 4.5 7.5l1-1L7 8l3.5-3.5 1 1z"/></svg>
                      Pays for itself in <strong>{paybackWeeks < 2 ? "under 2 weeks" : `~${Math.round(paybackWeeks)} weeks`}</strong>
                    </div>
                  ) : (
                    <div className="text-[10px] text-sand/30">
                      {state.avgBookingValue > 0 && state.extraBookingsPerMonth > 0
                        ? "Your site pays for itself almost immediately — the rest is pure profit."
                        : "Enter your booking value and expected volume above."}
                    </div>
                  )}
                  {singleBookingRatio < Infinity && (
                    <div className="text-[9px] text-sand/40 italic">
                      Just {singleBookingRatio} {singleBookingRatio === 1 ? "booking" : "bookings"} at {formatPrice(state.avgBookingValue || 1200)} each covers your entire website investment
                    </div>
                  )}
                </div>
              );
            })()}

            {/* AI Visibility value line — shown when AI tier is selected */}
            {state.aiVisibilityLevel > 0 && (() => {
              const aiTier = AI_VISIBILITY_TIERS.find((t) => t.id === state.aiVisibilityLevel as 1 | 2 | 3);
              if (!aiTier) return null;
              const roi = computeAiVisibilityROI(
                aiTier.price,
                state.avgBookingValue || 1200,
                DEFAULT_AI_EXTRA_BOOKINGS,
              );
              return (
                <div className="mt-3 pt-3 border-t border-gold/10">
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">📈</span>
                    <div>
                      <p className="text-[9px] text-sand/40 leading-relaxed">
                        AI Visibility ({aiTier.icon} {aiTier.label}):{" "}
                        <strong className="text-gold">{roi.annualRevenueFormatted}/year</strong> projected return from{" "}
                        <strong>{DEFAULT_AI_EXTRA_BOOKINGS} extra booking{DEFAULT_AI_EXTRA_BOOKINGS !== 1 ? "s" : ""}/month</strong>{" "}
                        — that&apos;s a <strong className="text-gold">{roi.returnMultipleFormatted}x</strong> return in year one.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ─── RECENT WORK PROOF ─── */}
          <RecentWorkCard />

          {/* ─── VS TEMPLATE COMPARISON ─── */}
          <div>
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer list-none py-2">
                <svg className="w-3 h-3 text-sand/30 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                <span className="text-[10px] font-semibold text-sand/50 hover:text-sand/70 transition-colors">
                  vs a ₹15,000 template site — honest comparison
                </span>
              </summary>
              <div className="mt-2 rounded-xl overflow-hidden border border-hairline">
                <div className="grid grid-cols-[1fr_48px_48px] gap-0 text-[8px] font-mono">
                  <div className="px-2.5 py-1.5 font-semibold text-sand/30 border-b border-hairline">Feature</div>
                  <div className="px-2.5 py-1.5 text-center text-sand/30 border-b border-hairline border-l">Template</div>
                  <div className="px-2.5 py-1.5 text-center text-sand/30 border-b border-hairline border-l">Yours</div>
                  {TEMPLATE_COMPARISON.map((row) => (
                    <div key={row.feature} className="contents" style={{ color: "var(--sand)" }}>
                      <div className="px-2.5 py-1.5 border-b border-hairline text-[8px]" style={{ borderColor: "var(--hairline)" }}>
                        {row.feature}
                      </div>
                      <div className="px-2.5 py-1.5 text-center border-b border-hairline border-l flex items-center justify-center" style={{ borderColor: "var(--hairline)" }}>
                        {row.template ? (
                          <svg className="w-2.5 h-2.5 text-pine" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 4.5L7 10 4.5 7.5l1-1L7 8l3.5-3.5 1 1z"/></svg>
                        ) : (
                          <svg className="w-2.5 h-2.5 text-red-500/40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8m0-8l-8 8"/></svg>
                        )}
                      </div>
                      <div className="px-2.5 py-1.5 text-center border-b border-hairline border-l flex items-center justify-center" style={{ borderColor: "var(--hairline)" }}>
                        {row.ours ? (
                          <svg className="w-2.5 h-2.5 text-pine" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 4.5L7 10 4.5 7.5l1-1L7 8l3.5-3.5 1 1z"/></svg>
                        ) : (
                          <svg className="w-2.5 h-2.5 text-red-500/40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8m0-8l-8 8"/></svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-2.5 py-2 text-[8px] text-sand/20 text-center border-t border-hairline">
                  A template site saves ₹3,000 upfront — but you lose booking, payments, packages, reviews, SEO, AI visibility, and support.
                </div>
              </div>
            </details>
          </div>

          {/* ─── POST-LAUNCH CARE PLAN (optional) ─── */}
          <div className="rounded-xl border border-gold/10 bg-gold/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🔒</span>
              <div>
                <h4 className="font-display text-xs font-bold text-sand">Your build is yours forever. Want real, paid help growing it?</h4>
                <p className="text-[8px] text-sand/20 mt-0.5">Optional — never required. Your site and data always stay yours either way.</p>
              </div>
            </div>

            {totals.foundingPartnerUnlocked && <FoundingPartnerBanner />}

            <div className="space-y-2 mb-3">
              {CARE_PLANS.map((plan) => {
                const resolvedPlan = plan.id === "growth" ? resolveGrowthPlanView(totals.grandTotal) : plan;
                return (
                  <CarePlanCard
                    key={plan.id}
                    plan={resolvedPlan}
                    selected={state.carePlan === plan.id}
                    billing={state.carePlanBilling}
                    onSelect={() => dispatch({ type: "SET_CARE_PLAN", plan: plan.id as CarePlanId })}
                    onBillingToggle={() => dispatch({
                      type: "SET_CARE_PLAN_BILLING",
                      billing: state.carePlanBilling === "monthly" ? "annual" : "monthly",
                    })}
                  />
                );
              })}
            </div>

            <p className="text-[8px] text-sand/20 text-center italic">
              {CARE_RETENTION_LINE}
            </p>
          </div>

          {/* ─── GUARANTEE ─── */}
          <GuaranteeLine />

          {/* ─── DELIVERY STRIP ─── */}
          <DeliveryStrip />

          {/* ─── REFERRAL REWARD ─── */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm mt-0.5">🎁</span>
              <div>
                <h4 className="font-display text-xs font-bold text-blue-400">Refer & Save {REFERRAL_DISCOUNT_PCT}%</h4>
                <div className="inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold bg-blue-500/20 text-blue-400 mt-1">
                  ⏱ {REFERRAL_WINDOW_DAYS} days left to refer & save {REFERRAL_DISCOUNT_PCT}%
                </div>
              </div>
            </div>
            <p className="text-[9px] text-sand/60 leading-relaxed mb-3">
              Know another business that needs this? Refer them within {REFERRAL_WINDOW_DAYS} days and take <strong>{REFERRAL_DISCOUNT_PCT}% off your Phase 1 build</strong> (save {formatPrice(Math.round(totals.phase1Total * (REFERRAL_DISCOUNT_PCT / 100)))}). 
              <br/><br/>
              <em>Honesty guard: One genuine referral that becomes a client = your discount applied.</em>
            </p>
            <div className="space-y-2 mb-3">
              <input
                type="text"
                placeholder="Referred business name"
                value={state.referredBusinessName}
                onChange={(e) => dispatch({ type: "SET_REFERRED_BUSINESS_NAME", name: e.target.value })}
                className="w-full bg-surface/50 border border-hairline rounded-lg px-2.5 py-2 text-xs text-sand font-mono outline-none focus:border-blue-500/50 transition-colors"
              />
              <input
                type="text"
                placeholder="Their WhatsApp or Email (optional)"
                value={state.referredContact}
                onChange={(e) => dispatch({ type: "SET_REFERRED_CONTACT", contact: e.target.value })}
                className="w-full bg-surface/50 border border-hairline rounded-lg px-2.5 py-2 text-xs text-sand font-mono outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `I'm getting my ${state.businessType || "rental"} website built by Hayer Technologies — genuinely good work. If you need one too, use my referral code ${state.quoteId} so we both get a perk.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Forward code {state.quoteId} on WhatsApp
            </a>
          </div>

          {/* ─── SEND ACTIONS ─── */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] text-sand/30 font-mono tracking-wider uppercase">Finalize</p>
            <button
              onClick={() => setShowLockModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-250 hover:brightness-110"
              style={{ background: "var(--gold)", color: "#0E1116" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Lock this scope
            </button>

            {/* Secondary: WhatsApp */}
            <a
              href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(
                `Hi! I just built my rental website scope on Rental Scope Studio.\n\n` +
                `Business: ${state.businessName || "Your Business"} (${bt})\n` +
                `City: ${state.city || "—"}\n` +
                `Investment: ${formatPrice(totals.grandTotal)}\n` +
                `Features: ${state.enabledFeatures.length} selected\n` +
                `Design: ${DESIGN_TIERS.find((t) => t.id === state.designTier)?.label}\n` +
                (state.aiVisibilityLevel > 0 ? `AI Visibility: Level ${state.aiVisibilityLevel}\n` : ``) +
                `Reward: ${totals.reward?.label ?? "—"}\n` +
                (state.carePlan !== "none" ? `Care: ${CARE_PLANS.find((p) => p.id === state.carePlan as CarePlanId)?.label} (${state.carePlanBilling})\n` : "") +
                `Brand: ${brandColors.name} palette, ${state.brand.vibe === "light" ? "Light" : "Dark"} theme\n` +
                `\nMeeting: ${state.preferredDay ? DAY_OPTIONS.find((d) => d.id === state.preferredDay)?.label : "—"} ${state.preferredSlot ? TIME_SLOTS.find((s) => s.id === state.preferredSlot)?.label : "—"}\n` +
                `Call me via: ${state.contactPreference ? CONTACT_PREFERENCES.find((c) => c.id === state.contactPreference)?.label : "—"}\n\n` +
                `I'd love to discuss this further!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-250"
              style={{ borderColor: "var(--hairline)", color: "var(--sand)" }}
            >
              <svg className="w-4 h-4 text-pine" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              📲 Also on WhatsApp
            </a>

            {/* Tertiary: PDF / Print */}
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-medium transition-all duration-250"
              style={{ color: "rgba(232,210,212,0.4)" }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5V2h6l2 2v1" />
                <path d="M2 7h12v6H2V7z" />
                <circle cx="11" cy="10" r=".5" fill="currentColor" />
              </svg>
              ⬇️ Download PDF quote
            </button>

            <p className="text-[7px] text-sand/20 text-center pt-1">
              Quote HT-R-2026-{String(Math.floor(Math.random() * 900) + 100)} · Prepared for {state.ownerName || state.businessName || "you"} · Valid for 7 days · Generated {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      ),
    },
    complete: {
      label: "Done",
      content: (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-pine/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-xl font-display font-bold text-sand mb-2">Your scope is locked.</h3>
          <p className="text-sm text-sand/50 max-w-xs mx-auto mb-6">
            Quote <strong>{state.quoteId}</strong> is secured. We will contact you at {state.preferredDay ? DAY_OPTIONS.find((d) => d.id === state.preferredDay)?.label : ""} {state.preferredSlot ? TIME_SLOTS.find((s) => s.id === state.preferredSlot)?.label : ""}.
          </p>
          <div className="w-full bg-surface/50 border border-hairline rounded-xl p-4 text-left space-y-3 mb-6">
             <div className="flex justify-between items-center border-b border-hairline pb-2">
               <span className="text-xs text-sand/40">Phase 1 Investment</span>
               <span className="font-mono font-bold text-sm text-ember">{formatPrice(totals.phase1Total)}</span>
             </div>
             {totals.phase2Total > 0 && (
               <div className="flex justify-between items-center border-b border-hairline pb-2">
                 <span className="text-xs text-sand/40">Phase 2 (Locked 6mos)</span>
                 <span className="font-mono font-bold text-sm text-blue-400">{formatPrice(totals.phase2Total)}</span>
               </div>
             )}
             {state.retainerOptIn && (
               <div className="flex justify-between items-center pb-2 border-b border-hairline">
                 <span className="text-xs text-sand/40">Growth Retainer</span>
                 <span className="font-mono font-bold text-sm text-pine">₹12k/mo</span>
               </div>
             )}
             {state.closeUpsells.length > 0 && (
               <div className="flex justify-between items-center">
                 <span className="text-xs text-sand/40">Add-ons ({state.closeUpsells.length})</span>
                 <span className="font-mono font-bold text-sm text-sand/60">Included</span>
               </div>
             )}
          </div>
          <div className="w-full bg-pine/5 border border-pine/20 rounded-xl p-4 text-left">
             <h4 className="text-xs font-semibold text-pine mb-1">🎁 {REFERRAL_WINDOW_DAYS} Days Left</h4>
             <p className="text-[10px] text-sand/50">Refer a business before your build starts to take {REFERRAL_DISCOUNT_PCT}% off your Phase 1 build. You save {formatPrice(Math.round(totals.phase1Total * (REFERRAL_DISCOUNT_PCT / 100)))}.</p>
          </div>
        </div>
      )
    }
  };

  const currentIndex = navSteps.findIndex((s) => s.id === step);

  // ── Render ──
  return (
    <div className="flex flex-col h-full">
      <div id="controls-scroll" className="flex-1 overflow-y-auto px-4 md:px-5 lg:px-6 py-4">
        {/* Welcome back */}
        <AnimatePresence>
          {state.restored && (
            <WelcomeBackBanner onDismiss={() => { /* simply let it stay */ }} />
          )}
        </AnimatePresence>

        {/* Base package — always visible */}
        <BasePackage />

        {/* Step indicator */}
        <div className="mb-5">
          <StepIndicator steps={navSteps} current={step} onNavigate={goToStep} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <SectionHeader title={sections[step]?.label ?? ""} />
            {sections[step]?.content}

            {/* Navigation buttons */}
            {step !== "complete" && (
              <div className="flex items-center gap-3 mt-6 pb-4">
                {currentIndex > 0 && (
                  <button
                    onClick={() => goToStep(navSteps[currentIndex - 1]!.id as WizardStepId)}
                    className="text-[10px] text-sand/30 hover:text-sand/60 transition-colors px-3 py-2"
                  >
                    ← Back
                  </button>
                )}
                {step !== "results" && (
                  <button
                    onClick={() => goToStep(navSteps[currentIndex + 1]!.id as WizardStepId)}
                    className="flex-1 text-center py-3.5 rounded-lg text-xs font-semibold transition-all duration-250"
                    style={{ background: "var(--ember)", color: "#fff" }}
                  >
                    Continue
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky estimate bar */}
      {step !== "complete" && <EstimateBar growthToast={growthToast} />}

      {/* Modals */}
      <LockScopeModal
        show={showLockModal}
        onClose={() => setShowLockModal(false)}
        state={state}
        totals={totals}
        dispatch={dispatch}
        brandColors={brandColors}
      />
    </div>
  );
}
