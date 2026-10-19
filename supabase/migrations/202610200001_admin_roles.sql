create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  permissions text[] not null default '{}',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_roles_name_length check (char_length(trim(name)) between 2 and 60)
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  role_id uuid references public.admin_roles(id) on delete restrict,
  is_owner boolean not null default false,
  is_active boolean not null default true,
  session_version integer not null default 1,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_username_format check (username ~ '^[A-Za-z0-9_.-]{3,40}$'),
  constraint admin_users_role_check check ((is_owner and role_id is null) or (not is_owner and role_id is not null))
);
create unique index if not exists admin_users_username_lower_key on public.admin_users (lower(username));

insert into public.admin_roles (name, permissions, is_system)
values ('Admin', array['dashboard.view','products.view','products.create','products.edit','inventory.view','inventory.adjust','orders.view','orders.update','refunds.view','categories.view','categories.manage','blogs.view','blogs.manage','media.upload'], true)
on conflict (name) do nothing;

alter table public.admin_roles enable row level security;
alter table public.admin_users enable row level security;
revoke all on public.admin_roles, public.admin_users from anon, authenticated;
grant select, insert, update, delete on public.admin_roles, public.admin_users to service_role;

create or replace function public.prevent_last_owner_change() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if old.is_owner and old.is_active and (select count(*) from public.admin_users where is_owner and is_active and id <> old.id) = 0 then
      raise exception 'Cannot remove the last active owner';
    end if;
    return old;
  end if;
  if old.is_owner and old.is_active and (not new.is_owner or not new.is_active) and
     (select count(*) from public.admin_users where is_owner and is_active and id <> old.id) = 0 then
    raise exception 'Cannot remove the last active owner';
  end if;
  return new;
end;
$$;
drop trigger if exists admin_users_keep_owner on public.admin_users;
create trigger admin_users_keep_owner before update or delete on public.admin_users
for each row execute function public.prevent_last_owner_change();
