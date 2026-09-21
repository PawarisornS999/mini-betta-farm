"use client";

import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import SectionHeading from "@/components/SectionHeading";
import { useBlogs } from "@/lib/hooks/useCatalog";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function Blog() {
  const { blogs: blogPosts } = useBlogs();
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).blog;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t.title}
          actionLabel={t.viewAll}
          actionHref="/blog"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-block text-accent font-semibold text-sm hover:text-accent-dark transition-colors"
          >
            {t.viewAllLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
