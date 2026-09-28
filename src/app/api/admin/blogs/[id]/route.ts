import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { logAdminActivity } from "@/lib/admin/products";
import { mapBlog, type BlogRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  if (!body.title?.trim() || !body.content?.trim() || !body.coverImage?.trim() || !body.category?.trim() || !body.author?.trim()) {
    return NextResponse.json({ success: false, message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ" }, { status: 400 });
  }
  const published = Boolean(body.published);
  const row = {
    title: body.title.trim(),
    slug: slugify(body.slug || body.title),
    excerpt: body.excerpt?.trim() ?? "",
    content: body.content.trim(),
    cover_image: body.coverImage.trim(),
    category: body.category.trim(),
    tags: Array.isArray(body.tags) ? body.tags.map((tag: string) => tag.trim()).filter(Boolean) : [],
    author: body.author.trim(),
    read_time: String(body.readTime || "1 min read").trim(),
    related_slugs: Array.isArray(body.relatedSlugs) ? body.relatedSlugs.map((slug: string) => slug.trim()).filter(Boolean) : [],
    published,
    published_at: published ? (body.publishedAt || new Date().toISOString()) : null,
    seo_title: body.seoTitle?.trim() || null,
    seo_description: body.seoDescription?.trim() || null,
  };
  try {
    const rows = await supabaseRest<BlogRow[]>(`blog_posts?id=eq.${encodeURIComponent(id)}&select=*`, {
      method: "PATCH",
      serviceRole: true,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    if (!rows[0]) return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    await logAdminActivity(session.username, "blog.update", id, { published });
    return NextResponse.json({ success: true, data: mapBlog(rows[0]) });
  } catch (error) {
    const message = error instanceof Error && error.message.toLowerCase().includes("slug")
      ? "Slug นี้ถูกใช้งานแล้ว"
      : error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const rows = await supabaseRest<Array<{ id: string }>>(`blog_posts?id=eq.${encodeURIComponent(id)}&select=id`, {
      method: "DELETE",
      serviceRole: true,
      headers: { Prefer: "return=representation" },
    });
    if (!rows[0]) return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    await logAdminActivity(session.username, "blog.delete", id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Delete failed" }, { status: 400 });
  }
}
