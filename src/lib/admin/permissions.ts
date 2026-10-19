export const PERMISSIONS = [
  "dashboard.view", "products.view", "products.create", "products.edit", "products.delete",
  "inventory.view", "inventory.adjust", "orders.view", "orders.update", "orders.delete",
  "refunds.view", "refunds.manage", "payment.view", "payment.edit",
  "categories.view", "categories.manage", "blogs.view", "blogs.manage",
  "media.upload", "admins.manage", "roles.manage",
] as const;
export type Permission = typeof PERMISSIONS[number];

