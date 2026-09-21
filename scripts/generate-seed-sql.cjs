/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "betta-seed-"));

try {
  try {
    execFileSync(
      path.join(root, "node_modules", ".bin", "tsc"),
      [
        "src/data/products.ts",
        "src/data/blogs.ts",
        "--module",
        "commonjs",
        "--target",
        "es2020",
        "--outDir",
        tempDir,
        "--skipLibCheck",
        "--noEmitOnError",
        "false",
      ],
      { cwd: root, stdio: "pipe" },
    );
  } catch {
    // The standalone compile reports unresolved type-only aliases but still emits JS.
  }

  const { products } = require(path.join(tempDir, "products.js"));
  const { blogPosts } = require(path.join(tempDir, "blogs.js"));
  const q = (value) =>
    value == null ? "null" : `'${String(value).replaceAll("'", "''")}'`;
  const textArray = (values = []) =>
    values.length ? `array[${values.map(q).join(",")}]::text[]` : "'{}'::text[]";
  const bool = (value) => (value ? "true" : "false");

  const productValues = products.map((product) => {
    const difficulty =
      product.difficultyLevel ??
      (product.difficulty === "intermediate" ? "medium" : product.difficulty);
    const stockQty =
      product.stockQty ??
      (product.stockStatus === "out_of_stock"
        ? 0
        : product.stockStatus === "low_stock"
          ? 3
          : 10);
    return `(${[
      q(product.id), q(product.name), q(product.slug ?? product.id), product.price,
      product.originalPrice ?? "null", q(product.description), q(product.species),
      q(product.color), q(difficulty), stockQty, q(product.stockStatus),
      product.waterTempMin ?? "null", product.waterTempMax ?? "null", q(product.waterTemp),
      q(product.feedingNotes), textArray(product.images), q(product.badge),
      bool(product.featured ?? Boolean(product.badge)), "true", q(product.seoTitle),
      q(product.seoDescription),
    ].join(",")})`;
  });

  const blogValues = blogPosts.map((post) => `(${[
    q(post.title), q(post.slug), q(post.excerpt), q(post.content), q(post.coverImage),
    q(post.category), textArray(post.tags), q(post.author), q(String(post.readTime)),
    textArray(post.relatedSlugs), bool(post.published ?? true),
    q(post.date ?? post.createdAt ?? new Date().toISOString()),
    q(post.seoTitle ?? post.seo?.title), q(post.seoDescription ?? post.seo?.description),
  ].join(",")})`);

  const sql = `insert into public.products (
  id,name,slug,price,original_price,description,species,color,difficulty_level,
  stock_qty,stock_status,water_temp_min,water_temp_max,water_temp,feeding_notes,
  images,badge,featured,published,seo_title,seo_description
) values
${productValues.join(",\n")}
on conflict (id) do update set
  name=excluded.name, slug=excluded.slug, price=excluded.price,
  original_price=excluded.original_price, description=excluded.description,
  species=excluded.species, color=excluded.color, difficulty_level=excluded.difficulty_level,
  stock_qty=excluded.stock_qty, stock_status=excluded.stock_status,
  water_temp_min=excluded.water_temp_min, water_temp_max=excluded.water_temp_max,
  water_temp=excluded.water_temp, feeding_notes=excluded.feeding_notes,
  images=excluded.images, badge=excluded.badge, featured=excluded.featured,
  published=excluded.published, seo_title=excluded.seo_title,
  seo_description=excluded.seo_description;

insert into public.blog_posts (
  title,slug,excerpt,content,cover_image,category,tags,author,read_time,
  related_slugs,published,published_at,seo_title,seo_description
) values
${blogValues.join(",\n")}
on conflict (slug) do update set
  title=excluded.title, excerpt=excluded.excerpt, content=excluded.content,
  cover_image=excluded.cover_image, category=excluded.category, tags=excluded.tags,
  author=excluded.author, read_time=excluded.read_time,
  related_slugs=excluded.related_slugs, published=excluded.published,
  published_at=excluded.published_at, seo_title=excluded.seo_title,
  seo_description=excluded.seo_description;
`;

  fs.writeFileSync(path.join(root, "supabase", "seed.sql"), sql);
  console.log(`Generated supabase/seed.sql (${products.length} products, ${blogPosts.length} posts)`);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
