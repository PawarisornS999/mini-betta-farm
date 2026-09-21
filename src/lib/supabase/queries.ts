import type { BlogPost, Category, Product } from "@/types";
import { mapBlog, mapCategory, mapProduct, type BlogRow, type CategoryRow, type ProductRow } from "./mappers";
import { supabaseRest } from "./rest";

export async function getProducts(): Promise<Product[]> {
  const rows = await supabaseRest<ProductRow[]>(
    "products?select=*&admin_status=neq.hidden&order=created_at.desc",
  );
  return rows.map(mapProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const rows = await supabaseRest<ProductRow[]>(
    `products?select=*&id=eq.${encodeURIComponent(id)}&admin_status=neq.hidden&limit=1`,
  );
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getBlogs(): Promise<BlogPost[]> {
  const rows = await supabaseRest<BlogRow[]>(
    "blog_posts?select=*&published=eq.true&order=published_at.desc.nullslast,created_at.desc",
  );
  return rows.map(mapBlog);
}

export async function getBlog(slug: string): Promise<BlogPost | null> {
  const rows = await supabaseRest<BlogRow[]>(
    `blog_posts?select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`,
  );
  return rows[0] ? mapBlog(rows[0]) : null;
}

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const categoryFilter = includeInactive ? "" : "&is_active=eq.true";
  const [categoryRows, productRows] = await Promise.all([
    supabaseRest<CategoryRow[]>(`categories?select=*${categoryFilter}&order=sort_order.asc,name.asc`, { serviceRole: includeInactive }),
    supabaseRest<Array<{ category: string | null }>>(includeInactive ? "products?select=category" : "products?select=category&admin_status=neq.hidden", { serviceRole: includeInactive }),
  ]);
  const counts = new Map<string, number>();
  for (const product of productRows) {
    if (product.category) counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  return categoryRows.map((row) => mapCategory(row, counts.get(row.slug) ?? 0));
}
