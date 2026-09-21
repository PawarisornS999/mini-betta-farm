create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_active_order_idx
  on public.categories (is_active, sort_order, name);

-- Preserve existing product categories while making them manageable records.
insert into public.categories (name, slug, sort_order)
select distinct trim(category),
  lower(regexp_replace(trim(category), '[^a-zA-Z0-9]+', '-', 'g')),
  0
from public.products
where nullif(trim(category), '') is not null
on conflict (slug) do nothing;

insert into public.categories (name, slug, sort_order)
values ('Betta Fish', 'betta-fish', 0)
on conflict (slug) do nothing;

update public.products p
set category = c.slug
from public.categories c
where lower(trim(p.category)) = lower(trim(c.name));

alter table public.categories enable row level security;
drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories" on public.categories
for select to public using (is_active = true);
