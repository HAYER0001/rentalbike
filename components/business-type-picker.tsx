"use client";

import { motion } from "framer-motion";
import { BUSINESS_TYPES, LABEL_MAP, type BusinessType, CURRENCY, BASE_PRICE, FEATURES } from "@/lib/config";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

/** SVG icon component per business type — clean line-art, no emoji */
function TypeIcon({ type, className }: { type: BusinessType; className?: string }) {
  const svgProps = {
    className: cn("w-10 h-10", className),
    viewBox: "0 0 40 40",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "bikes":
      return (
        <svg {...svgProps}>
          <circle cx="20" cy="20" r="14" />
          <path d="M26 20a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" />
          <path d="M20 10v4" />
          <path d="M16 12l8 3" />
          <path d="M16 28l8-3" />
        </svg>
      );
    case "cars":
      return (
        <svg {...svgProps}>
          <path d="M6 26v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2h20v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4" />
          <path d="M6 26l3-9h22l3 9H6z" />
          <circle cx="11" cy="26" r="3" />
          <circle cx="29" cy="26" r="3" />
          <path d="M9 17l2-5h18l2 5" />
        </svg>
      );
    case "scooters":
      return (
        <svg {...svgProps}>
          <path d="M16 26l-3-10h4l2 6h4l1-4h6" />
          <circle cx="13" cy="28" r="3" />
          <circle cx="28" cy="28" r="3" />
          <path d="M10 8l4 2 6 12" />
          <path d="M20 10h8" />
        </svg>
      );
    case "camping":
      return (
        <svg {...svgProps}>
          <path d="M12 34l8-24 8 24" />
          <path d="M8 34h24" />
          <path d="M16 34l4-12 4 12" />
          <path d="M20 10v2" />
          <path d="M16 18h8" />
        </svg>
      );
    case "events":
      return (
        <svg {...svgProps}>
          <rect x="6" y="10" width="28" height="16" rx="2" />
          <path d="M14 10V6" />
          <path d="M26 10V6" />
          <path d="M10 18h20" />
          <path d="M10 22h14" />
        </svg>
      );
    case "cameras":
      return (
        <svg {...svgProps}>
          <rect x="4" y="12" width="32" height="20" rx="3" />
          <circle cx="20" cy="22" r="6" />
          <path d="M16 12l2-3h4l2 3" />
          <circle cx="20" cy="22" r="2" />
          <path d="M28 16h2" />
        </svg>
      );
    case "ebikes":
      return (
        <svg {...svgProps}>
          <circle cx="20" cy="20" r="14" />
          <circle cx="20" cy="20" r="8" />
          <path d="M20 6v6" />
          <path d="M20 28v6" />
          <path d="M6 20h6" />
          <path d="M28 20h6" />
          <path d="M12 12l4 4" />
          <path d="M24 24l4 4" />
        </svg>
      );
    case "other":
      return (
        <svg {...svgProps}>
          <rect x="8" y="8" width="24" height="24" rx="3" />
          <path d="M16 16h8" />
          <path d="M16 20h8" />
          <path d="M16 24h4" />
        </svg>
      );
  }
}

function TypeTile({
  type,
  selected,
  onClick,
}: {
  type: BusinessType;
  selected: boolean;
  onClick: () => void;
}) {
  const labels = LABEL_MAP[type];
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border p-5 min-w-[140px] transition-all duration-250",
        selected
          ? "border-ember bg-ember/10 shadow-ember-glow"
          : "border-hairline bg-surface hover:border-sand/20 hover:bg-surface/80"
      )}
    >
      <TypeIcon
        type={type}
        className={selected ? "text-ember" : "text-sand/40"}
      />
      <span
        className={cn(
          "font-display text-sm font-semibold whitespace-nowrap",
          selected ? "text-sand" : "text-sand/60"
        )}
      >
        {type === "bikes"
          ? "Bikes / Motorcycles"
          : type === "events"
            ? "Event & Party"
            : type === "cameras"
              ? "Cameras & Drones"
              : type === "ebikes"
                ? "Bicycles / E-bikes"
                : type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
      <span className="text-[10px] text-sand/30">{labels.items}</span>
    </motion.button>
  );
}

export function BusinessTypePicker() {
  const { state, dispatch, totals } = useCart();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        {/* Logo mark */}
        <div className="mb-8 mx-auto w-16 h-16 rounded-2xl bg-ember/10 border border-ember/20 flex items-center justify-center">
          <svg
            viewBox="0 0 32 32"
            className="w-8 h-8 text-ember"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="8" width="24" height="18" rx="2" />
            <circle cx="12" cy="17" r="3" />
            <circle cx="20" cy="17" r="3" />
            <path d="M4 8L8 4h16l4 4" />
          </svg>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-sand mb-4">
          What do you <span className="text-ember">rent</span>?
        </h1>
        <p className="text-sand/50 text-base mb-10 max-w-md mx-auto leading-relaxed">
          Pick your rental vertical — we&apos;ll tailor the configurator, pricing, and
          preview to your industry.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-wrap justify-center gap-3 max-w-3xl"
      >
        {BUSINESS_TYPES.map((type, i) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04, duration: 0.3 }}
          >
            <TypeTile
              type={type}
              selected={state.businessType === type}
              onClick={() => dispatch({ type: "SET_BUSINESS_TYPE", businessType: type })}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Quick stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-12 flex gap-8 text-xs text-sand/30"
      >
        <span>Starting from {CURRENCY}{BASE_PRICE.toLocaleString("en-IN")}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">3 design tiers · {FEATURES.length} feature modules</span>
        <span className="hidden sm:inline">·</span>
        <span>CareReward rewards</span>
      </motion.div>
    </div>
  );
}
