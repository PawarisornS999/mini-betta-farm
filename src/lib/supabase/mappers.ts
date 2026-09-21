import type { BlogPost, Category, Product } from "@/types";

export type ProductRow = {
  id: string;
  name: string;
  slug: string | null;
  price: number | string;
  original_price: number | string | null;
  description: string;
  species: Product["species"];
  color: string;
  difficulty_level: Product["difficultyLevel"] | null;
  stock_qty: number;
  stock_status: Product["stockStatus"];
  water_temp_min: number | null;
  water_temp_max: number | null;
  water_temp: string | null;
  feeding_notes: string;
  images: string[];
  badge: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  sku?: string;
  category?: string | null;
  gender?: Product["gender"];
  pattern?: string | null;
  tail_type?: string | null;
  age_months?: number | null;
  size_cm?: number | string | null;
  cost?: number | string | null;
  reserved_qty?: number;
  admin_status?: Product["adminStatus"];
};

export type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: BlogPost["category"];
  tags: string[];
  author: string;
  read_time: string;
  related_slugs: string[];
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
};

export function mapCategory(row: CategoryRow, productCount = 0): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    productCount,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? undefined,
    price: Number(row.price),
    originalPrice:
      row.original_price == null ? undefined : Number(row.original_price),
    description: row.description,
    species: row.species,
    color: row.color,
    difficultyLevel: row.difficulty_level ?? undefined,
    difficulty:
      row.difficulty_level === "medium" ? "intermediate" : row.difficulty_level ?? undefined,
    stockQty: row.stock_qty,
    stockStatus: row.stock_status,
    waterTempMin: row.water_temp_min ?? undefined,
    waterTempMax: row.water_temp_max ?? undefined,
    waterTemp: row.water_temp ?? undefined,
    feedingNotes: row.feeding_notes,
    images: row.images ?? [],
    badge: row.badge ?? undefined,
    featured: row.featured,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sku: row.sku,
    category: row.category ?? undefined,
    gender: row.gender,
    pattern: row.pattern ?? undefined,
    tailType: row.tail_type ?? undefined,
    ageMonths: row.age_months ?? undefined,
    sizeCm: row.size_cm == null ? undefined : Number(row.size_cm),
    cost: row.cost == null ? undefined : Number(row.cost),
    reservedQty: row.reserved_qty ?? 0,
    adminStatus: row.admin_status,
  };
}

export function mapBlog(row: BlogRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    category: row.category,
    tags: row.tags ?? [],
    author: row.author,
    readTime: row.read_time,
    relatedSlugs: row.related_slugs ?? [],
    published: row.published,
    date: row.published_at ?? row.created_at,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    createdAt: row.published_at ?? row.created_at,
    updatedAt: row.updated_at,
  };
}
