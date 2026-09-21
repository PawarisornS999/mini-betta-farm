"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ComponentProps<typeof motion.button> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
}

const variants = {
  primary:
    "bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/25",
  secondary: "bg-foreground text-white hover:bg-accent",
  outline:
    "border-2 border-foreground/15 text-foreground hover:border-accent hover:text-accent",
  ghost: "text-foreground/70 hover:text-accent hover:bg-foreground/5",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes = {
  sm: "px-4 py-2 text-xs rounded-xl",
  md: "px-6 py-3 text-sm rounded-2xl",
  lg: "px-8 py-3.5 text-sm rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={cn(
        "font-semibold transition-colors duration-200 inline-flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {loading && <LoadingDots />}
      {children}
    </motion.button>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
