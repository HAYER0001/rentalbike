"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlsPanel } from "./controls-panel";
import { LivePreview } from "./live-preview";
import { DebugPanel } from "./debug-panel";
import { useCart } from "@/lib/store";
import { getLabels, getBrandTheme, getReadableTextColor, type BusinessType } from "@/lib/config";

/** Two-pane configurator: wizard controls (left) + live preview (right) */
export function ConfiguratorShell() {
  const { state, dispatch } = useCart();
  const labels = getLabels(state.businessType as BusinessType);
  const theme = getBrandTheme(state.brand);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);

  // Business-type-aware document title
  useEffect(() => {
    const bt = state.businessType;
    const name = state.businessName || "Your Business";
    if (bt) {
      const labels = getLabels(bt);
      document.title = `${name} — ${labels.items} Website Scope | Rental Scope Studio`;
    } else {
      document.title = "Design Your Rental Website — by Hayer Technologies";
    }
  }, [state.businessType, state.businessName]);

  return (
    <div className="h-[100dvh] flex flex-col bg-ink">
      {/* ─── Top nav ─── */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-hairline bg-ink/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: "SET_BUSINESS_TYPE", businessType: null })}
            className="flex items-center gap-2 text-sand/40 hover:text-sand transition-colors"
            title="Change business type"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2L4 8l6 6" />
            </svg>
          </button>
          <div className="w-px h-5 bg-hairline" />
          <span className="font-display text-sm font-semibold text-sand">
            Rental Scope Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[10px] text-sand/30 font-mono tracking-wider uppercase">
            {labels.items}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-pine animate-pulse" />
        </div>
      </header>

      {/* ─── Mobile mini-preview strip ─── */}
      {state.businessType && (
        <div className="brand-live md:hidden border-b border-hairline bg-ink/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate" style={{ color: theme["--sand"] }}>
                {state.businessName || "Your Business"}
              </span>
              <span className="text-[9px] truncate" style={{ color: `${theme["--sand"]}40` }}>
                Premium {labels.items} {state.city ? `· ${state.city}` : ""}
              </span>
            </div>
          </div>
          <button
            onClick={() => setPreviewSheetOpen(true)}
            className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
            style={{ background: `${theme["--ember"]}15`, color: theme["--ember"] }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 8s2-5 7-5 7 5 7 5-2 5-7 5-7-5-7-5z" />
              <circle cx="8" cy="8" r="2" />
            </svg>
            Preview
          </button>
        </div>
      )}

      {/* ─── Two-pane layout ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Controls pane (wizard) — full width on mobile, 420px on desktop */}
        <aside className="w-full md:w-[400px] lg:w-[440px] shrink-0 overflow-y-auto border-r border-hairline bg-ink/50">
          <ControlsPanel />
        </aside>

        {/* Preview pane — hidden on mobile, flex on desktop */}
        <main className="hidden md:flex flex-1 min-w-0">
          <LivePreview />
        </main>
      </div>

      {/* ─── Mobile: floating preview sheet ─── */}
      <AnimatePresence>
        {previewSheetOpen && (
          <motion.div
            key="preview-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="brand-live fixed inset-0 z-50 md:hidden flex flex-col"
            style={{ background: theme["--bg"] }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-ink/90 backdrop-blur-md shrink-0">
              <span className="font-display text-sm font-semibold text-sand">Live Preview</span>
              <button
                onClick={() => setPreviewSheetOpen(false)}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-full"
                style={{ background: `${theme["--hairline"]}`, color: theme["--sand"] }}
              >
                Close
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <LivePreview />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile: floating Preview eye button ─── */}
      {state.businessType && !previewSheetOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => setPreviewSheetOpen(true)}
          className="brand-live md:hidden fixed bottom-[120px] right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: theme["--ember"] }}
        >
          <svg className="w-6 h-6" style={{ color: getReadableTextColor(theme["--ember"]) }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 10s2-6 9-6 9 6 9 6-2 6-9 6-9-6-9-6z" />
            <circle cx="10" cy="10" r="2.5" />
          </svg>
        </motion.button>
      )}

      {/* ─── Debug self-test panel (hidden unless ?debug=1) ─── */}
      <DebugPanel />
    </div>
  );
}
