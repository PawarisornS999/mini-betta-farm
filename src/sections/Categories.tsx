"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { useCategories } from "@/lib/hooks/useCatalog";

export default function Categories() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).categories;
  const { categories } = useCategories();
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t.heading}
          </h2>
          <p className="text-muted text-sm">{t.subheading}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8"
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card-bg rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-accent/10 transition-all duration-300">
                  <span className="text-2xl sm:text-3xl">🐟</span>
                </div>
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-medium text-foreground/70 group-hover:text-accent transition-colors block">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted">
                    {cat.productCount} {t.fishSuffix}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
