import { redirect } from "next/navigation";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import BlogsAdminClient from "@/components/admin/BlogsAdminClient";
import { getAdminBlogs } from "@/lib/admin/blogs";

export default async function AdminBlogsPage() {
  if (!hasPermission(await getAdminSession(), "blogs.view")) redirect("/admin/forbidden");
  return <BlogsAdminClient initialBlogs={await getAdminBlogs()} />;
}
