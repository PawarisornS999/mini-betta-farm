"use client";

import { motion } from "motion/react";

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ width: size, height: size }}
      className="border-2 border-accent/30 border-t-accent rounded-full"
    />
  );
}
