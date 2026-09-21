"use client";

import { useState } from "react";
import { motion } from "motion/react";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { useCategories, useProducts } from "@/lib/hooks/useCatalog";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function SpeciesCollection() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).collection;
  const categoryFilters = [
    { value: "all", label: t.filterAll },
    ...categories
      .filter((category) => category.isActive !== false)
      .map((category) => ({ value: category.slug, label: category.name })),
  ];

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t.title} actionLabel={t.viewAll} />

        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {categoryFilters.map((filter) => (
            <motion.button
              key={filter.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.value
                  ? "bg-accent text-white shadow-md"
                  : "bg-card-bg text-foreground/60 hover:bg-accent/10"
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
