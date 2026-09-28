import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getAdminBlogs } from "@/lib/admin/blogs";
import { logAdminActivity } from "@/lib/admin/products";
import { mapBlog, type BlogRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

type BlogInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  author?: string;
  readTime?: string | number;
  relatedSlugs?: string[];
  published?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/(^-|-$)/g, "");
}

function validate(body: BlogInput) {
  if (!body.title?.trim()) return "กรุณากรอกชื่อบทความ";
  if (!body.content?.trim()) return "กรุณากรอกเนื้อหาบทความ";
  if (!body.coverImage?.trim()) return "กรุณาเพิ่มรูปปกบทความ";
  if (!body.category?.trim()) return "กรุณาเลือกหมวดหมู่";
  if (!body.author?.trim()) return "กรุณากรอกชื่อผู้เขียน";
  return null;
}

function toRow(body: BlogInput) {
  const published = Boolean(body.published);
  return {
    title: body.title?.trim(),
    slug: slugify(body.slug || body.title || "article"),
    excerpt: body.excerpt?.trim() ?? "",
    content: body.content?.trim() ?? "",
    cover_image: body.coverImage?.trim(),
    category: body.category?.trim(),
    tags: body.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    author: body.author?.trim(),
    read_time: String(body.readTime || "1 min read").trim(),
    related_slugs: body.relatedSlugs?.map((slug) => slug.trim()).filter(Boolean) ?? [],
    published,
    published_at: published ? new Date().toISOString() : null,
    seo_title: body.seoTitle?.trim() || null,
    seo_description: body.seoDescription?.trim() || null,
  };
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ success: true, data: await getAdminBlogs() });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Load failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as BlogInput;
  const validationError = validate(body);
  if (validationError) return NextResponse.json({ success: false, message: validationError }, { status: 400 });
  try {
    const rows = await supabaseRest<BlogRow[]>("blog_posts?select=*", {
      method: "POST",
      serviceRole: true,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(toRow(body)),
    });
    const blog = mapBlog(rows[0]);
    await logAdminActivity(session.username, "blog.create", blog.id ?? blog.slug, { published: blog.published });
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.toLowerCase().includes("slug")
      ? "Slug นี้ถูกใช้งานแล้ว"
      : error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
