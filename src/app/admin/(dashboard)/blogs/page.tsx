import BlogsAdminClient from "@/components/admin/BlogsAdminClient";
import { getAdminBlogs } from "@/lib/admin/blogs";

export default async function AdminBlogsPage() {
  return <BlogsAdminClient initialBlogs={await getAdminBlogs()} />;
}
