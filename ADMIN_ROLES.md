# Admin roles and permissions

## Setup

1. Apply `supabase/migrations/202610200001_admin_roles.sql` to the configured Supabase project.
2. Apply `supabase/migrations/202610200002_admin_bootstrap.sql`, `supabase/migrations/202610200003_admin_setup_existing_owner.sql`, and `supabase/migrations/202610200004_admin_custom_permissions.sql` in order. Configure `ADMIN_SETUP_TOKEN` (a long random token) and `ADMIN_SESSION_SECRET` (at least 32 random characters). No admin username or password is stored in environment variables.
3. Open `/admin/setup` and enter the setup token, a new Owner username, and a new password. This creates the first Owner if no users exist, or replaces the single legacy Owner created from environment credentials. It can be completed only once. Remove `ADMIN_SETUP_TOKEN` after setup. Existing cookies are invalidated because the session format has changed.
4. Open `/admin/manage` as Owner. To add a Seller, choose **Roles → ใช้ตัวอย่าง Seller (สินค้าและสต็อก)**, review the selected permissions, and save. The screen then selects the new Role in **ผู้ดูแล**, where you create a username and password for each person. You can create any other Role in the same way. New passwords must have 12–128 characters.

## Rules

- Owners have all permissions and can manage accounts and Roles. The final active Owner cannot be disabled or demoted.
- Other users inherit permissions from exactly one Role. The `Admin` Role is seeded as a starting point. A Role cannot be deleted while users are assigned to it.
- Owners can add named custom Permissions in `/admin/manage`. Each custom Permission maps to one existing action such as `products.edit`. Assigning it to a Role grants that action. A custom Permission cannot target Owner-only actions, and it cannot be deleted while a Role uses it. New application actions still require a code change before they can be permission controlled.
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
