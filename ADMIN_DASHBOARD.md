# Bettafish admin dashboard

## Scope delivered

The first admin release focuses on product operations: catalog visibility,
fish attributes, pricing, product media, status, and stock. It uses the same
Next.js application and Supabase project as the storefront.

## Product workflow

1. Sign in at `/admin/login`.
2. Open **Products** and select **Add product**.
3. Enter SKU, strain, color, price, stock, status, and optional fish details.
4. Upload JPG, PNG, or WebP images (maximum 10 MB each), or paste image URLs.
5. Save. Available products with stock are published to the storefront.
6. Use **Adjust stock** for later stock changes so every change is recorded.
7. Use **Hide** to remove a product from the storefront without deleting its
   history.

## Status behavior

- `available`: visible on the storefront while stock is greater than zero.
- `reserved`: held for a customer and hidden from normal sale.
- `sold`: hidden from the storefront.
- `draft`: incomplete and hidden from the storefront.
- `hidden`: manually removed from the storefront.

## Security

- Admin pages and APIs require a signed, HTTP-only session cookie.
- The Supabase secret key is read only by Next.js server routes.
- Public storefront reads remain protected by Supabase Row Level Security.
- Stock adjustments run in a PostgreSQL function that prevents negative stock
  and writes an inventory log in the same transaction.
- Product removal is soft-delete by design.

## Suggested next phase

Add order management, customer records, promotions, reports, settings, and
role-based accounts after the product workflow is accepted. The database
already includes order and audit foundations for that expansion.
