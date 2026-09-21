# Supabase integration

This project is connected to the Supabase project `bettafish-web`.

## What is included

- Public product and blog reads through Next.js route handlers.
- Secure checkout through the `place_order` PostgreSQL function.
- Server-side price and stock validation.
- Atomic order creation, order items, stock updates, and inventory logs.
- Row Level Security for all application tables.
- Existing static catalog and blog content imported into Supabase.
- Password-protected admin dashboard for product and inventory management.
- Product image uploads to the public `product-media` Storage bucket.
- Activity and inventory audit logs.

## Local environment

The local `.env.local` contains the project URL, publishable key, server-only
secret key, and admin login settings. Never expose `SUPABASE_SECRET_KEY` or
`ADMIN_SESSION_SECRET` to browser code or commit `.env.local` to Git.

For a different Supabase project, copy `.env.example` to `.env.local`, replace
the URL and publishable key, then run:

1. `supabase/migrations/202609150001_initial_schema.sql` in Supabase SQL Editor.
2. `supabase/seed.sql` in Supabase SQL Editor.
3. `supabase/migrations/202609150002_admin_dashboard.sql` in Supabase SQL Editor.
4. `supabase/migrations/202609170001_categories.sql` in Supabase SQL Editor.
5. `supabase/migrations/202609210001_order_workflow.sql` in Supabase SQL Editor.

The order workflow migration reserves stock for 24 hours, sets a fixed 80 THB
shipping fee, creates a private `payment-slips` bucket, adds a customer order
access token, and provides an atomic admin function for payment, shipping and
stock restoration. The supplied TTB and PromptPay details are initialized in
`store_settings`; verify them in the admin dashboard before accepting payments.

## Admin dashboard

- Sign in at `/admin/login` using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from
  `.env.local`.
- `/admin` shows product, stock, and catalog health summaries.
- `/admin/products` supports search, filters, add, edit, hide, image upload, and
  stock adjustment.
- `/admin/inventory` provides a focused low-stock and inventory view.

Admin API routes use the server-only Supabase secret key and require a signed,
HTTP-only admin session cookie. Product deletion is intentionally implemented
as a reversible hide action so order and inventory history remain intact.

## API routes

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/blogs`
- `GET /api/blogs/:slug`
- `POST /api/orders/checkout`
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET, POST /api/admin/products`
- `PATCH, DELETE /api/admin/products/:id`
- `POST /api/admin/inventory`
- `POST /api/admin/media`
- `GET /api/categories` (active storefront categories with product counts)
- `GET, POST /api/admin/categories`
- `PATCH, DELETE /api/admin/categories/:id`

Checkout accepts customer details plus product IDs and quantities. Prices and
totals are always calculated inside PostgreSQL; browser-supplied prices are not
trusted.

## Verification performed

- ESLint passed.
- TypeScript type-check passed.
- The schema migration ran successfully on Supabase.
- 12 products and 6 blog posts were imported.
- `place_order` was exercised as the `anon` role inside a rolled-back
  transaction, confirming order creation and server-side total calculation
  without leaving test data or changing stock.
- The admin schema and Storage bucket migration ran successfully on Supabase.
