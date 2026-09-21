import { NextResponse } from "next/server";
import { getBlogs } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const blogs = await getBlogs();
    return NextResponse.json({
      success: true,
      data: { data: blogs, total: blogs.length, page: 1, pageSize: blogs.length, totalPages: 1 },
    });
  } catch (error) {
    console.error("Failed to load blog posts", error);
    return NextResponse.json(
      { success: false, message: "Unable to load blog posts", code: "BLOGS_LOAD_FAILED" },
      { status: 503 },
    );
  }
}

