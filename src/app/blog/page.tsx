"use client";

import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import BlogCard from "@/components/BlogCard";
import { useBlogs } from "@/lib/hooks/useCatalog";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function BlogPage() {
  const { blogs: blogPosts, loading, error } = useBlogs();
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).blog;

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t.pageTitle}
            </h1>
            <p className="text-muted max-w-2xl mx-auto">
              {t.pageSubtitle}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-muted">Loading articles...</div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
