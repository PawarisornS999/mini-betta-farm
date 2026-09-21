import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlog, getBlogs } from "@/lib/supabase/queries";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import BlogPostContent from "./BlogPostContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlog(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.seoTitle ?? post.seo?.title ?? post.title,
    description: post.seoDescription ?? post.seo?.description ?? post.excerpt,
    openGraph: {
      title: post.seoTitle ?? post.seo?.title ?? post.title,
      description: post.seoDescription ?? post.seo?.description ?? post.excerpt,
      type: "article",
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlog(slug);

  if (!post) notFound();

  const blogPosts = await getBlogs();
  const relatedPosts = blogPosts.filter((p) =>
    post.relatedSlugs.includes(p.slug),
  );

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={
          post.seoDescription ?? post.seo?.description ?? post.excerpt
        }
        image={post.coverImage}
        url={`https://minibettafarm.com/blog/${post.slug}`}
        datePublished={post.createdAt ?? post.date ?? new Date().toISOString()}
        author={post.author}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "หน้าแรก", url: "https://minibettafarm.com" },
          { name: "บล็อก", url: "https://minibettafarm.com/blog" },
          {
            name: post.title,
            url: `https://minibettafarm.com/blog/${post.slug}`,
          },
        ]}
      />
      <BlogPostContent post={post} relatedPosts={relatedPosts} />
    </>
  );
}
