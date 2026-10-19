# Admin roles and permissions

## Setup

1. Apply `supabase/migrations/202610200001_admin_roles.sql` to the configured Supabase project.
2. Keep `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` configured. On the first login after the migration, the existing environment account is inserted as the first Owner. Existing cookies are invalidated because the session format has changed.
3. Open `/admin/manage` as Owner to create additional Owners, Admin users, and Roles. New passwords must have 12–128 characters.

## Rules

- Owners have all permissions and can manage accounts and Roles. The final active Owner cannot be disabled or demoted.
- Other users inherit permissions from exactly one Role. The `Admin` Role is seeded as a starting point. A Role cannot be deleted while users are assigned to it.
- `payment.view`, `payment.edit`, `refunds.manage`, `admins.manage`, and `roles.manage` are reserved for Owners. The API rejects these permissions in custom Roles.
- API routes check the permission for each action. The admin menu and pages also use these permissions. A changed Role or account state takes effect on the next request; changing a user also invalidates their current session.
- Accounts are disabled instead of deleted to preserve activity history. Role and account changes are recorded in `activity_logs`.

## Permission map

| Area | Permissions |
| --- | --- |
| Dashboard | `dashboard.view` |
| Products | `products.view`, `products.create`, `products.edit`, `products.delete` |
| Inventory | `inventory.view`, `inventory.adjust` |
| Orders | `orders.view`, `orders.update`, `orders.delete` |
| Refunds | `refunds.view`, `refunds.manage` (Owner only) |
| Payment settings | `payment.view`, `payment.edit` (Owner only) |
| Categories | `categories.view`, `categories.manage` |
| Blogs | `blogs.view`, `blogs.manage` |
| Media | `media.upload` |
| Access management | `admins.manage`, `roles.manage` (Owner only) |
