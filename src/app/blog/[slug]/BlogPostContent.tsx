"use client";

import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import { getT } from "@/lib/i18n";
import { useLangStore } from "@/store/lang";
import type { BlogPost } from "@/types";

interface BlogPostContentProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostContent({
  post,
  relatedPosts,
}: BlogPostContentProps) {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted mb-6">
            <Link href="/" className="hover:text-accent">
              {t.nav.home}
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-accent">
              {t.nav.blog}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-accent/15 text-accent text-xs font-semibold px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-sm text-muted">{post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>
                {t.blog.by} {post.author}
              </span>
              <span>•</span>
              <time>{post.createdAt}</time>
            </div>
          </header>

          <div className="relative aspect-[2/1] rounded-3xl overflow-hidden mb-10">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>

          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted prose-a:text-accent prose-strong:text-foreground prose-li:text-muted">
            {post.content.split("\n").map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return <br key={i} />;
              if (trimmed.startsWith("## "))
                return (
                  <h2
                    key={i}
                    className="text-2xl font-bold text-foreground mt-8 mb-4"
                  >
                    {trimmed.slice(3)}
                  </h2>
                );
              if (trimmed.startsWith("### "))
                return (
                  <h3
                    key={i}
                    className="text-xl font-semibold text-foreground mt-6 mb-3"
                  >
                    {trimmed.slice(4)}
                  </h3>
                );
              if (trimmed.startsWith("#### "))
                return (
                  <h4
                    key={i}
                    className="text-lg font-semibold text-foreground mt-4 mb-2"
                  >
                    {trimmed.slice(5)}
                  </h4>
                );
              if (trimmed.startsWith("- **")) {
                const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
                if (match)
                  return (
                    <p key={i} className="text-muted ml-4 mb-1">
                      • <strong className="text-foreground">{match[1]}</strong>
                      {match[2] ? `: ${match[2]}` : ""}
                    </p>
                  );
              }
              if (trimmed.startsWith("- "))
                return (
                  <p key={i} className="text-muted ml-4 mb-1">
                    • {trimmed.slice(2)}
                  </p>
                );
              if (trimmed.match(/^\d+\.\s/))
                return (
                  <p key={i} className="text-muted ml-4 mb-1">
                    {trimmed}
                  </p>
                );
              if (trimmed.startsWith("|"))
                return (
                  <p key={i} className="text-muted text-sm font-mono mb-0.5">
                    {trimmed}
                  </p>
                );
              return (
                <p key={i} className="text-muted leading-relaxed mb-4">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t.blog.relatedArticles}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
