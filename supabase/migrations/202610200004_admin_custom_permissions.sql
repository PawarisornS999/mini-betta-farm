-- A custom permission is a named grant for one existing admin action.
create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null default '',
  grants_permission text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_permissions_key_format check (key ~ '^custom\.[a-z0-9_]{3,50}$'),
  constraint admin_permissions_name_length check (char_length(trim(name)) between 2 and 80),
  constraint admin_permissions_target_allowed check (grants_permission in (
    'dashboard.view','products.view','products.create','products.edit','products.delete',
    'inventory.view','inventory.adjust','orders.view','orders.update','orders.delete',
    'refunds.view','categories.view','categories.manage','blogs.view','blogs.manage','media.upload'
  ))
);
alter table public.admin_permissions enable row level security;
revoke all on public.admin_permissions from anon, authenticated;
grant select, insert, update, delete on public.admin_permissions to service_role;
