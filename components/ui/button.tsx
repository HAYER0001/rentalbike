"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-display font-semibold rounded-lg transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 disabled:opacity-40 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-ember text-white hover:bg-ember/90 hover:shadow-ember-glow active:scale-[0.97]",
      secondary: "bg-surface text-sand border border-hairline hover:bg-surface/80",
      ghost: "text-sand/60 hover:text-sand hover:bg-white/5",
      outline: "border border-hairline text-sand bg-transparent hover:bg-white/5",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-5 text-sm",
      lg: "h-12 px-7 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
