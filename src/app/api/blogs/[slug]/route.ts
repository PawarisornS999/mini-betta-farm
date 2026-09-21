import { NextResponse } from "next/server";
import { getBlog } from "@/lib/supabase/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const blog = await getBlog(slug);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog post not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("Failed to load blog post", error);
    return NextResponse.json(
      { success: false, message: "Unable to load blog post", code: "BLOG_LOAD_FAILED" },
      { status: 503 },
    );
  }
}

