"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/store";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    </div>
  ),
});
import {
  CURRENCY,
  getLabels,
  getVisibleFeatures,
  getFeatureLabel,
  DESIGN_TIERS,
  GHOST_DURATION_MS,
  CARE_REWARD_TARGET,
  getBrandTheme,
  getReadableTextColor,
  hexToRgbaString,
  type BusinessType,
  type FeatureId,
  FEATURES,
  type FeatureConfig,
} from "@/lib/config";

// ───── Ghost hook ─────

function useGhostFeatures(enabled: FeatureId[]): Set<FeatureId> {
  const [ghosts, setGhosts] = useState<Set<FeatureId>>(new Set());
  const prevRef = useRef(enabled);
  const timers = useRef<Map<FeatureId, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const prev = prevRef.current;
    const off = prev.filter((f) => !enabled.includes(f));
    const on = enabled.filter((f) => !prev.includes(f));

    on.forEach((f) => {
      const t = timers.current.get(f);
      if (t) { clearTimeout(t); timers.current.delete(f); }
      setGhosts((g) => { const n = new Set(g); n.delete(f); return n; });
    });

    off.forEach((f) => {
      setGhosts((g) => { const n = new Set(g); n.add(f); return n; });
      const t = setTimeout(() => {
        setGhosts((g) => { const n = new Set(g); n.delete(f); return n; });
        timers.current.delete(f);
      }, GHOST_DURATION_MS);
      timers.current.set(f, t);
    });

    prevRef.current = enabled;
    const t2 = timers.current;
    return () => { t2.forEach((t) => clearTimeout(t)); };
  }, [enabled]);

  return ghosts;
}

// ───── Helpers ─────

const previewRadial = (color: string, opacity = "0.03") =>
  `radial-gradient(ellipse at 30% 50%, ${color}, transparent 60%)`;

const sectionVariants = {
  hidden: { opacity: 0, height: 0, y: 24 },
  visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, height: 0, overflow: "hidden", paddingTop: 0, paddingBottom: 0, borderTopWidth: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const ghostStyle = { opacity: 0.3, border: "1px dashed var(--hairline)", pointerEvents: "none" as const, filter: "grayscale(1)" };

// ───── Section wrapper (handles enabled/ghost/AnimatePresence) ─────

function PreviewSection({
  show,
  isGhost,
  children,
  delay = 0,
}: {
  show: boolean;
  isGhost: boolean;
  children: ReactNode;
  delay?: number;
}) {
  if (!show) return null;
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate={isGhost ? { ...sectionVariants.visible } : "visible"}
      exit="exit"
      style={isGhost ? ghostStyle : undefined}
      className="border-t"
    >
      {children}
    </motion.section>
  );
}

// ───── Business type icon map ─────

const TYPE_ICONS: Record<string, string> = {
  bikes: "M7 2l1 2h4l1-2 2 1-1 2H6L5 3zM4 6h12v1H4zM5 7l1 7h8l1-7H5zm1 8a1 1 0 110 2 1 1 0 010-2zm8 0a1 1 0 110 2 1 1 0 010-2z",
  cars: "M3 7l1-3h10l1 3v6h-1a1.5 1.5 0 01-3 0H7a1.5 1.5 0 01-3 0H3V7zm2 1h2v2H5V8zm6 0h2v2h-2V8z",
  scooters: "M9 2h2l1 3h3v2h-2l-1 3H8l-1-3H4V7h4L9 2zm-2 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z",
  camping: "M8 2l7 12H1L8 2zm-2 8h4L8 5 6 10zm0 2h4v2H6v-2z",
  events: "M3 4h10v2H3V4zm0 4h10v2H3V8zm0 4h8v2H3v-2zm11-6l2 2-5 5-2-2 5-5z",
  cameras: "M2 5h4l2-2h4l2 2h2v10H2V5zm3 6a3 3 0 106 0 3 3 0 00-6 0z",
  ebikes: "M5 3l1-1h4l1 1v2H5V3zm0 4h6l1 1v2l-1 1H6l-1-1V7zm2 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm7 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z",
  other: "M3 5a2 2 0 012-2h6l4 4v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 2h4a1 1 0 110 2H7a1 1 0 110-2z",
};

function TypeIcon({ type }: { type: string }) {
  const d = TYPE_ICONS[type] ?? TYPE_ICONS.other;
  return (
    <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" className="opacity-60">
      <path d={d} />
    </svg>
  );
}

// ───── Main preview component ─────

export function LivePreview() {
  const { state, totals } = useCart();
  const bt = state.businessType as BusinessType;
  const labels = getLabels(bt);
  const theme = getBrandTheme(state.brand);
  const designTier = DESIGN_TIERS.find((t) => t.id === state.designTier);
  const isPremium = state.designTier === "premiumMotion";
  const is3d = state.designTier === "signature3d";
  const ghostFeatures = useGhostFeatures(state.enabledFeatures);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!is3d || !previewRef.current) return;
    const el = previewRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setPreviewVisible(entry?.isIntersecting ?? true),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [is3d]);

  const aiLevel = state.aiVisibilityLevel;
  const visibleFeatures = getVisibleFeatures(bt);
  const needsRating = state.googleRating > 0;

  const hasFeature = (id: FeatureId) => state.enabledFeatures.includes(id);
  const showFeature = (id: FeatureId) => hasFeature(id) || ghostFeatures.has(id);
  const isGhostFeature = (id: FeatureId) => ghostFeatures.has(id) && !hasFeature(id);

  const getFeature = (id: FeatureId): FeatureConfig | undefined =>
    FEATURES.find((f) => f.id === id);

  const heroAccent = is3d ? theme["--gold"] : theme["--ember"];
  const heroAccentText = getReadableTextColor(heroAccent);

  const itemCount = 8 + state.extraItems;

  if (!state.businessType) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl border border-dashed border-hairline flex items-center justify-center">
            <svg className="w-8 h-8 text-sand/20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="8" width="24" height="18" rx="2" />
              <circle cx="12" cy="17" r="3" />
              <circle cx="20" cy="17" r="3" />
            </svg>
          </div>
          <p className="text-sm text-sand/30">Pick a rental type to see your site preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-live h-full flex flex-col overflow-hidden">
      {/* ─── Browser chrome ─── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-hairline shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 max-w-[50%] mx-auto">
          <div className="bg-white/5 rounded-full py-1.5 px-4 text-[10px] text-sand/30 text-center truncate">
            {state.businessName ? `${state.businessName.toLowerCase().replace(/\s+/g, "")}.com` : "your-rental-business.com"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-sand/20 font-mono">{designTier?.label ?? "Standard"}</span>
          {is3d && <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
          {isPremium && <span className="w-1.5 h-1.5 rounded-full bg-ember/60 animate-pulse" />}
        </div>
      </div>

      {/* ─── Site header — logo/wordmark, retints live with brand ─── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ background: theme["--surface"], borderColor: theme["--hairline"] }}
      >
        {state.brand.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.brand.logoDataUrl}
            alt={state.businessName || "Business logo"}
            className="h-7 max-w-[140px] object-contain"
          />
        ) : (
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
          >
            {state.businessName || `${labels.items.replace(/^./, (c) => c.toUpperCase())} Co.`}
          </span>
        )}
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-medium" style={{ color: hexToRgbaString(theme["--sand"], 0.4) }}>
          <span>Browse</span>
          <span>Book</span>
          <span>Contact</span>
        </div>
      </div>

      {/* ─── Preview canvas ─── */}
      <motion.div
        className="flex-1 overflow-y-auto"
        style={{ background: is3d ? "#080A0E" : theme["--bg"] }}
        layout
      >
        <AnimatePresence mode="popLayout">
          {/* ═══════════ HERO ═══════════ */}
          <motion.section
            key="hero"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className={`relative min-h-[45vh] flex items-center justify-center px-6 py-16 overflow-hidden ${is3d ? "border-b border-gold/10" : ""}`}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0"
              style={{
                background: is3d
                  ? `radial-gradient(ellipse at 50% 30%, ${theme["--gold"]}08, transparent 60%)`
                  : previewRadial(theme["--ember"]),
              }}
            />

            {/* Real 3D scene for Signature 3D */}
            {is3d && (
              <div
                ref={previewRef}
                className="absolute inset-0"
              >
                {previewVisible && (
                  <ThreeScene modelType={state.businessType} />
                )}
                {/* Fallback gradient when 3D is not visible */}
                {!previewVisible && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at 50% 30%, ${theme["--gold"]}08, transparent 60%)`,
                    }}
                  />
                )}
              </div>
            )}
            {/* "✨ 3D Experience" badge */}
            {is3d && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold font-mono uppercase tracking-wider"
                style={{
                  background: `${theme["--gold"]}15`,
                  color: theme["--gold"],
                  border: `1px solid ${theme["--gold"]}30`,
                }}
              >
                <span className="text-[10px]">✨</span> 3D Experience
              </div>
            )}

            <div className="relative text-center max-w-lg z-10">
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: hexToRgbaString(heroAccent, 0.1) }}
                >
                  <div style={{ color: hexToRgbaString(heroAccent, 0.6) }}>
                    <TypeIcon type={state.businessType} />
                  </div>
                </div>
              </div>
              <span
                className="inline-block text-[10px] tracking-[0.2em] uppercase mb-4 font-mono"
                style={{ color: heroAccent }}
              >
                Premium {labels.items} rental
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight mb-3"
                style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
              >
                {state.businessName || `Premium ${labels.items}`}
                {state.city && (
                  <span className={`block text-lg font-normal mt-1 ${is3d ? "text-gold/60" : "text-sand/40"}`}>
                    in {state.city}
                  </span>
                )}
              </h2>
              <p className={`text-sm max-w-sm mx-auto leading-relaxed ${is3d ? "text-sand/50" : "text-sand/40"}`}>
                Browse, book, and {labels.renter} — your next adventure starts here.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold inline-block cursor-default"
                  style={{ background: heroAccent, color: heroAccentText }}
                >
                  Browse {labels.items}
                </span>
                <span
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold inline-block border cursor-default"
                  style={{ borderColor: theme["--hairline"], color: theme["--sand"] }}
                >
                  How it works
                </span>
              </div>
            </div>
          </motion.section>

          {/* ═══════════ VISIBILITY PANEL — How customers will find you ═══════════ */}
          {aiLevel > 0 && (
            <motion.section
              key="visibility"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="border-t px-6 py-8"
              style={{ borderColor: theme["--hairline"] }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 text-[10px] text-pine font-mono mb-4">
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" /></svg>
                  How customers will find you
                </div>
                <div className="space-y-3">
                  {/* ── SEO proof: Google result (level 1+) ── */}
                  {aiLevel >= 1 && (
                    <motion.div
                      key="seo-proof"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                      className="rounded-xl p-4"
                      style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3 text-gold" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 5h5l-4 3 1.5 5L8 11l-4 3 1.5-5-4-3h5z"/></svg>
                        <span className="text-[10px] text-sand/30">Rank #1 on Google</span>
                      </div>
                      <div className="text-xs text-pine font-medium">
                        {state.businessName || "Your Business"} — Premium {labels.items} in {state.city || "Your City"}
                      </div>
                      <div className="text-[10px] text-sand/30 mt-0.5 leading-relaxed">
                        {state.businessName || "Business"}.com · Book the best {labels.items} online. Free delivery, instant confirmation, trusted by 500+ renters.
                      </div>
                    </motion.div>
                  )}

                  {/* ── AEO proof: AI Overview (level 2+) ── */}
                  {aiLevel >= 2 && (
                    <motion.div
                      key="aeo-proof"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                      className="rounded-xl p-4"
                      style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3 text-ember" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/></svg>
                        <span className="text-[9px] text-sand/20 font-mono uppercase tracking-wider">AI Answer by Google AI</span>
                      </div>
                      <p className="text-[10px] text-sand/40 leading-relaxed">
                        &ldquo;If you&apos;re looking for {labels.items} in {state.city || "your area"},{" "}
                        <strong className="text-sand/60">{state.businessName || "this business"}</strong> is a top choice —
                        highly rated, seamless booking, and great customer support.&rdquo;
                      </p>
                    </motion.div>
                  )}

                  {/* ── GEO proof: ChatGPT recommendation (level 3) ── */}
                  {aiLevel >= 3 && (
                    <motion.div
                      key="geo-proof"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                      className="rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${theme["--hairline"]}` }}
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2"
                        style={{ background: "#1a1a2e", borderBottom: `1px solid ${theme["--hairline"]}` }}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
                        <span className="text-[9px] text-sand/40 font-mono">ChatGPT</span>
                      </div>
                      <div className="px-4 py-3" style={{ background: theme["--surface"] }}>
                        <div className="text-[10px] text-sand/30 mb-2 font-mono">
                          User: &ldquo;What&apos;s the best {labels.items} rental in {state.city || "my area"}?&rdquo;
                        </div>
                        <div className="text-[10px] text-ember/70 leading-relaxed">
                          <span className="text-sand/40">ChatGPT: </span>
                          &ldquo;I&apos;d recommend{" "}
                          <strong className="text-sand/60">{state.businessName || "this rental"}</strong> — they have the best selection of {labels.items}, seamless online booking, and are highly rated in {state.city || "the area"}.&rdquo;
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Complete AI Visibility seal (level 3) ── */}
                  {aiLevel >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 text-[10px] text-gold font-semibold py-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 4.5L7 10 4.5 7.5l1-1L7 8l3.5-3.5 1 1z"/></svg>
                      Complete AI Visibility ✓
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* ═══════════ INVENTORY GRID ═══════════ */}
          <motion.section
            key="inventory"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="border-t px-6 py-10"
            style={{ borderColor: theme["--hairline"] }}
          >
            <div className="max-w-4xl mx-auto">
              <h3
                className="text-lg font-semibold mb-6 text-center"
                style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
              >
                Our {labels.items}
                <span className="block text-[10px] font-mono font-normal mt-1" style={{ color: `${theme["--sand"]}50` }}>
                  {itemCount} {labels.items} available
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: Math.min(itemCount, 16) }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: theme["--surface"],
                      border: `1px solid ${theme["--hairline"]}`,
                    }}
                    whileHover={isPremium || is3d ? { y: -4, scale: 1.02, transition: { duration: 0.2 } } : undefined}
                  >
                    <div
                      className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center"
                      style={{ background: `${theme["--ember"]}08` }}
                    >
                      <svg className="w-8 h-8 opacity-20" style={{ color: heroAccent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="6" width="16" height="14" rx="2" />
                        <path d="M8 6V4h8v2" />
                        <path d="M12 11v6" />
                        <path d="M9 14h6" />
                      </svg>
                    </div>
                    <div className="text-[10px] font-medium truncate" style={{ color: theme["--sand"] }}>
                      {labels.itemSingular.replace(/^(a|an)\s/, "")} #{i + 1}
                    </div>
                    <div className="text-[9px] mt-0.5" style={{ color: heroAccent }}>
                      {CURRENCY}{(Math.floor(Math.random() * 8) + 3) * 100}/day
                    </div>
                  </motion.div>
                ))}
                {itemCount > 16 && (
                  <div className="col-span-full text-center py-4">
                    <span className="text-[10px] font-mono" style={{ color: `${theme["--sand"]}30` }}>
                      +{itemCount - 16} more {labels.items}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* ═══════════ FEATURES GRID (always visible, shows watched features) ═══════════ */}
          <motion.section
            key="features-grid"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="border-t px-6 py-10"
            style={{ borderColor: theme["--hairline"] }}
          >
            <div className="max-w-4xl mx-auto">
              <h3
                className="text-lg font-semibold mb-6 text-center"
                style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
              >
                Why choose {state.businessName || "us"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Easy booking", icon: "M5 3h6l4 4v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm1 4h4" },
                  { label: "Best prices", icon: "M4 4h8v2H4V4zm0 4h8v2H4V8zm0 4h6v2H4v-2z" },
                  { label: "24/7 support", icon: "M8 1a7 7 0 100 14A7 7 0 008 1zM8 5v4m0 2v.01" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl p-4 text-center"
                    style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}
                  >
                    <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${heroAccent}15` }}>
                      <svg className="w-4 h-4" style={{ color: heroAccent }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: theme["--sand"] }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ═══════════ BOOKING WIDGET ═══════════ */}
          {(showFeature("onlineBooking") || showFeature("onlinePayments")) && (
            <PreviewSection
              key="booking"
              show={showFeature("onlineBooking")}
              isGhost={isGhostFeature("onlineBooking")}
            >
              <div className="px-6 py-10" style={{ borderColor: theme["--hairline"] }}>
                <div className="max-w-lg mx-auto">
                  <h3
                    className="text-base font-semibold mb-5 text-center"
                    style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                  >
                    Book your {labels.itemSingular.replace(/^(a|an)\s/, "")}
                  </h3>
                  <div className="rounded-xl overflow-hidden" style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}>
                    {/* Date picker row */}
                    <div className="flex border-b" style={{ borderColor: theme["--hairline"] }}>
                      {["Mon 14", "Tue 15", "Wed 16", "Thu 17"].map((d, i) => (
                        <div
                          key={d}
                          className={`flex-1 py-3 text-center text-[10px] font-mono cursor-default ${i === 2 ? "" : "opacity-30"}`}
                          style={{ color: i === 2 ? heroAccent : `${theme["--sand"]}50`, borderBottom: i === 2 ? `2px solid ${heroAccent}` : "2px solid transparent" }}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    {/* Time slots */}
                    <div className="p-4">
                      <div className="text-[10px] font-mono mb-3" style={{ color: `${theme["--sand"]}40` }}>
                        Available slots — Wed 16
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"].map((slot, i) => (
                          <span
                            key={slot}
                            className={`px-3 py-1.5 rounded-md text-[10px] cursor-default ${i === 1 ? "font-semibold" : "opacity-40"}`}
                            style={{
                              background: i === 1 ? `${heroAccent}20` : theme["--hairline"],
                              color: i === 1 ? heroAccent : `${theme["--sand"]}50`,
                              border: i === 1 ? `1px solid ${heroAccent}40` : `1px solid transparent`,
                            }}
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span
                          className="flex-1 text-center py-2.5 rounded-lg text-xs font-semibold cursor-default"
                          style={{ background: heroAccent, color: heroAccentText }}
                        >
                          Confirm booking
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PreviewSection>
          )}

          {/* ═══════════ PAYMENT SECTION ═══════════ */}
          <PreviewSection
            key="payments"
            show={showFeature("onlinePayments")}
            isGhost={isGhostFeature("onlinePayments")}
          >
            <div className="px-6 py-10">
              <div className="max-w-lg mx-auto">
                <h3
                  className="text-base font-semibold mb-5 text-center"
                  style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                >
                  Secure your booking
                </h3>
                <div className="rounded-xl overflow-hidden" style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-[11px]">
                      <span style={{ color: `${theme["--sand"]}60` }}>Rental fee</span>
                      <span className="font-mono" style={{ color: theme["--sand"] }}>{CURRENCY}2,400</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span style={{ color: `${theme["--sand"]}60` }}>Refundable deposit</span>
                      <span className="font-mono" style={{ color: theme["--sand"] }}>{CURRENCY}5,000</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-2" style={{ borderTop: `1px solid ${theme["--hairline"]}` }}>
                      <span style={{ color: `${theme["--sand"]}60` }}>Advance due now</span>
                      <span className="font-mono font-bold" style={{ color: heroAccent }}>{CURRENCY}500</span>
                    </div>
                    <span
                      className="block text-center py-2.5 rounded-lg text-xs font-semibold mt-2 cursor-default"
                      style={{ background: heroAccent, color: heroAccentText }}
                    >
                      Pay {CURRENCY}500 Advance
                    </span>
                    <p className="text-[9px] text-center" style={{ color: `${theme["--sand"]}30` }}>
                      Razorpay / UPI · Auto-receipt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PreviewSection>

          {/* ═══════════ KYC UPLOAD ═══════════ */}
          {visibleFeatures.some((f) => f.id === "kycUpload") && (
            <PreviewSection
              key="kyc"
              show={showFeature("kycUpload")}
              isGhost={isGhostFeature("kycUpload")}
            >
              <div className="px-6 py-10">
                <div className="max-w-lg mx-auto text-center">
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                  >
                    Verify your ID
                  </h3>
                  <p className="text-[10px] mb-4" style={{ color: `${theme["--sand"]}40` }}>
                    Upload license or ID before pickup
                  </p>
                  <div
                    className="rounded-xl border-2 border-dashed p-6 max-w-xs mx-auto"
                    style={{ borderColor: theme["--hairline"] }}
                  >
                    <svg className="w-10 h-10 mx-auto mb-2 opacity-20" style={{ color: heroAccent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-[10px]" style={{ color: `${theme["--sand"]}40` }}>
                      Tap to upload your document
                    </p>
                  </div>
                </div>
              </div>
            </PreviewSection>
          )}

          {/* ═══════════ PACKAGES / TOURS ═══════════ */}
          {visibleFeatures.some((f) => f.id === "packagesTours") && (
            <PreviewSection
              key="packages"
              show={showFeature("packagesTours")}
              isGhost={isGhostFeature("packagesTours")}
            >
              <div className="px-6 py-10">
                <div className="max-w-4xl mx-auto">
                  <h3
                    className="text-lg font-semibold mb-1 text-center"
                    style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                  >
                    {labels.packageLabel ? `Explore our ${labels.packageLabel}` : "Packages & bundles"}
                  </h3>
                  <p className="text-[10px] text-center mb-6" style={{ color: `${theme["--sand"]}40` }}>
                    Curated experiences, premium {labels.items}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { title: "Weekend Explorer", days: "2 days", desc: `Best ${labels.items} for a quick getaway`, price: "3,999" },
                      { title: "Adventure Pro", days: "3 days", desc: `Premium ${labels.items} + guided experience`, price: "7,499" },
                      { title: "Elite Journey", days: "5 days", desc: `Full ${labels.renter} experience with concierge`, price: "14,999" },
                    ].map((pkg, i) => (
                      <div
                        key={pkg.title}
                        className="rounded-xl overflow-hidden"
                        style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}
                      >
                        <div className="h-24 flex items-center justify-center" style={{ background: `${heroAccent}08` }}>
                          <div className="text-center">
                            <div className="text-[24px] font-bold font-display" style={{ color: heroAccent }}>0{i + 1}</div>
                            <div className="text-[8px] font-mono uppercase tracking-widest" style={{ color: `${theme["--sand"]}30` }}>{pkg.days}</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-semibold" style={{ color: theme["--sand"] }}>{pkg.title}</div>
                          <p className="text-[10px] mt-1" style={{ color: `${theme["--sand"]}40` }}>{pkg.desc}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-mono text-xs font-bold" style={{ color: heroAccent }}>
                              {CURRENCY}{pkg.price}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-mono" style={{ background: `${heroAccent}15`, color: heroAccent }}>
                              Book now
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block text-[10px] font-semibold px-4 py-2 rounded-lg cursor-default" style={{ background: `${heroAccent}10`, color: heroAccent }}>
                      View all packages →
                    </span>
                  </div>
                </div>
              </div>
            </PreviewSection>
          )}

          {/* ═══════════ DELIVERY SCHEDULING ═══════════ */}
          {visibleFeatures.some((f) => f.id === "deliveryScheduling") && (
            <PreviewSection
              key="delivery"
              show={showFeature("deliveryScheduling")}
              isGhost={isGhostFeature("deliveryScheduling")}
            >
              <div className="px-6 py-10">
                <div className="max-w-lg mx-auto text-center">
                  <h3
                    className="text-base font-semibold mb-5"
                    style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                  >
                    Delivery & pickup
                  </h3>
                  <div className="rounded-xl overflow-hidden" style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 text-left">
                        <svg className="w-5 h-5 shrink-0" style={{ color: heroAccent }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                          <path d="M10 6v4l3 3" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-[10px] font-mono" style={{ color: `${theme["--sand"]}40` }}>Delivery date</div>
                          <div className="text-xs" style={{ color: theme["--sand"] }}>Wed 16 Jul · 10:00–12:00</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <svg className="w-5 h-5 shrink-0" style={{ color: heroAccent }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M10 2a6 6 0 00-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 00-6-6z" />
                          <circle cx="10" cy="8" r="2" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-[10px] font-mono" style={{ color: `${theme["--sand"]}40` }}>Delivery address</div>
                          <div className="text-xs" style={{ color: theme["--sand"] }}>Your location · {state.city || "City"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PreviewSection>
          )}

          {/* ═══════════ REVIEWS ═══════════ */}
          {visibleFeatures.some((f) => f.id === "reviewsWall") && (
            <PreviewSection
              key="reviews"
              show={showFeature("reviewsWall")}
              isGhost={isGhostFeature("reviewsWall")}
            >
              <div className="px-6 py-10">
                <div className="max-w-4xl mx-auto">
                  <h3
                    className="text-lg font-semibold mb-1 text-center"
                    style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                  >
                    What our {labels.renter === "rider" ? "riders" : labels.renter === "driver" ? "drivers" : `${labels.renter}s`} say
                  </h3>
                  {needsRating && (
                    <div className="text-center mb-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: theme["--gold"] }}>
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 5h5l-4 3 1.5 5L8 11l-4 3 1.5-5-4-3h5z"/></svg>
                        {state.googleRating}.0 Google rating
                      </span>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { name: "Arjun M.", text: `Amazing selection of ${labels.items}. The booking was seamless and the ${labels.itemSingular.replace(/^(a|an)\s/, "")} was in perfect condition!`, stars: 5 },
                      { name: "Priya K.", text: `Great service, highly recommend for anyone looking for ${labels.items} in ${state.city || "the city"}. Will definitely use again.`, stars: 5 },
                      { name: "Rahul S.", text: `Best rental experience I've had. Professional staff, ${labels.itemSingular.replace(/^(a|an)\s/, "")} was clean and well-maintained.`, stars: 5 },
                    ].map((review) => (
                      <div
                        key={review.name}
                        className="rounded-xl p-4"
                        style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}
                      >
                        <div className="flex items-center gap-0.5 mb-2">
                          {Array.from({ length: review.stars }).map((_, i) => (
                            <svg key={i} className="w-3 h-3" style={{ color: theme["--gold"] }} viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 1l1.5 5h5l-4 3 1.5 5L8 11l-4 3 1.5-5-4-3h5z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-[10px] leading-relaxed mb-2" style={{ color: `${theme["--sand"]}60` }}>
                          &ldquo;{review.text}&rdquo;
                        </p>
                        <div className="text-[9px] font-medium" style={{ color: `${theme["--sand"]}40` }}>
                          — {review.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PreviewSection>
          )}

          {/* ═══════════ FLEXIBLE PRICING ═══════════ */}
          {visibleFeatures.some((f) => f.id === "flexiblePricing") && (
            <PreviewSection
              key="pricing"
              show={showFeature("flexiblePricing")}
              isGhost={isGhostFeature("flexiblePricing")}
            >
              <div className="px-6 py-10 text-center">
                <div className="max-w-lg mx-auto">
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                  >
                    Flexible rental periods
                  </h3>
                  <p className="text-[10px] mb-5" style={{ color: `${theme["--sand"]}40` }}>
                    Pay by the hour, day, week, or month
                  </p>
                  <div className="flex gap-2 justify-center">
                    {[
                      { label: "Hourly", price: "₹299/hr" },
                      { label: "Daily", price: "₹999/day", active: true },
                      { label: "Weekly", price: "₹4,999/wk" },
                      { label: "Monthly", price: "₹14,999/mo" },
                    ].map((period) => (
                      <div
                        key={period.label}
                        className="flex-1 rounded-xl p-3"
                        style={{
                          background: period.active ? `${heroAccent}10` : theme["--surface"],
                          border: `1px solid ${period.active ? `${heroAccent}30` : theme["--hairline"]}`,
                        }}
                      >
                        <div className="text-[10px] font-medium" style={{ color: theme["--sand"] }}>{period.label}</div>
                        <div className={`text-[10px] font-mono mt-1 ${period.active ? "" : "opacity-40"}`} style={{ color: period.active ? heroAccent : `${theme["--sand"]}50` }}>
                          {period.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PreviewSection>
          )}

          {/* ═══════════ BLOG SECTION ═══════════ */}
          {visibleFeatures.some((f) => f.id === "blogGuides") && (
            <PreviewSection
              key="blog"
              show={showFeature("blogGuides")}
              isGhost={isGhostFeature("blogGuides")}
            >
              <div className="px-6 py-10">
                <div className="max-w-4xl mx-auto">
                  <h3
                    className="text-lg font-semibold mb-1 text-center"
                    style={{ color: theme["--sand"], fontFamily: theme["--font-display"] }}
                  >
                    Tips & guides
                  </h3>
                  <p className="text-[10px] text-center mb-6" style={{ color: `${theme["--sand"]}40` }}>
                    Everything you need to know about {labels.items} in {state.city || "your city"}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { title: `Top 10 ${labels.items} for beginners`, tag: "Guide" },
                      { title: `${state.city || "Your city"} — best ${labels.items} routes`, tag: "Travel" },
                      { title: `How to choose the right ${labels.itemSingular.replace(/^(a|an)\s/, "")}`, tag: "Tips" },
                    ].map((article) => (
                      <div
                        key={article.title}
                        className="rounded-xl overflow-hidden"
                        style={{ background: theme["--surface"], border: `1px solid ${theme["--hairline"]}` }}
                      >
                        <div className="h-20 flex items-center justify-center" style={{ background: `${theme["--pine"]}10` }}>
                          <svg className="w-8 h-8 opacity-20" style={{ color: theme["--pine"] }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        </div>
                        <div className="p-3">
                          <span className="text-[8px] font-mono uppercase tracking-wider" style={{ color: theme["--pine"] }}>
                            {article.tag}
                          </span>
                          <div className="text-[10px] font-medium mt-1" style={{ color: theme["--sand"] }}>
                            {article.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PreviewSection>
          )}

          {/* ═══════════ STATS BAR ═══════════ */}
          <motion.section
            key="stats"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="border-t px-6 py-10"
            style={{ borderColor: theme["--hairline"] }}
          >
            <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
              {[
                { value: "500+", label: "Happy renters" },
                { value: `${itemCount}+`, label: `${labels.items}` },
                { value: `${needsRating ? state.googleRating : "4.9"}★`, label: "Avg. rating" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold font-display" style={{ color: heroAccent }}>
                    {s.value}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: `${theme["--sand"]}50` }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ═══════════ FOOTER ═══════════ */}
          <motion.section
            key="footer"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="border-t px-6 py-10 text-center"
            style={{ borderColor: theme["--hairline"], background: theme["--surface"] }}
          >
            <div className="max-w-md mx-auto">
              <div className="text-xs font-semibold font-display mb-1" style={{ color: theme["--sand"] }}>
                {state.businessName || "Your Business Name"}
              </div>
              <p className="text-[10px]" style={{ color: `${theme["--sand"]}40` }}>
                Premium {labels.items} rental{state.city ? ` in ${state.city}` : ""}
              </p>
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme["--hairline"]}` }}>
                <div className="flex justify-center gap-4 text-[9px] font-mono" style={{ color: `${theme["--sand"]}30` }}>
                  <span>WhatsApp booking</span>
                  <span>·</span>
                  <span>SSL secured</span>
                  <span>·</span>
                  <span>Google Maps</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══════════ TIER BADGE ═══════════ */}
          {designTier && (
            <motion.section
              key="tier-badge"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="border-t px-6 py-6 text-center"
              style={{ borderColor: theme["--hairline"] }}
            >
              <div
                className="inline-block rounded-full px-4 py-1.5 text-[9px] font-display font-semibold tracking-wider uppercase"
                style={{
                  background: designTier.id === "signature3d" ? `${theme["--gold"]}15` : designTier.id === "premiumMotion" ? `${theme["--ember"]}15` : theme["--hairline"],
                  color: designTier.id === "signature3d" ? theme["--gold"] : designTier.id === "premiumMotion" ? theme["--ember"] : theme["--sand"],
                }}
              >
                {designTier.label} build
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── 3D keyframes (injected once) ─── */}
      <style jsx>{`
        @keyframes rotate3d {
          0% { transform: rotateY(0deg) rotateX(5deg); }
          100% { transform: rotateY(360deg) rotateX(5deg); }
        }
      `}</style>
    </div>
  );
}
