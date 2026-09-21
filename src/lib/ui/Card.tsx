"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -8 } : undefined}
      className={cn(
        "bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
