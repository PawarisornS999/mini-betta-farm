import type { BlogPost } from "@/types";
import { mapBlog, type BlogRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

export async function getAdminBlogs(): Promise<BlogPost[]> {
  const rows = await supabaseRest<BlogRow[]>(
    "blog_posts?select=*&order=updated_at.desc",
    { serviceRole: true },
  );
  return rows.map(mapBlog);
}
