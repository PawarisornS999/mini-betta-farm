"use client";

import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { useProducts } from "@/lib/hooks/useCatalog";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function FeaturedFish() {
  const { products } = useProducts();
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).featured;
  const featured = products.filter((p) => p.badge).slice(0, 4);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t.title} actionLabel={t.viewAll} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
