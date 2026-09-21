"use client";

import Link from "next/link";
import { motion } from "motion/react";

interface SectionHeadingProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function SectionHeading({
  title,
  actionLabel,
  actionHref = "/shop",
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between mb-8"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
        {title}
      </h2>
      {actionLabel && (
        <Link href={actionHref}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors border border-accent px-5 py-2 rounded-full"
          >
            {actionLabel}
          </motion.button>
        </Link>
      )}
    </motion.div>
  );
}
