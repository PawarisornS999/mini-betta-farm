alter table public.products
  add column if not exists sku text,
  add column if not exists category text default 'Betta Fish',
  add column if not exists gender text default 'unsexed',
  add column if not exists pattern text,
  add column if not exists tail_type text,
  add column if not exists age_months integer,
  add column if not exists size_cm numeric(5,2),
  add column if not exists cost numeric(12,2) default 0,
  add column if not exists reserved_qty integer not null default 0,
  add column if not exists admin_status text not null default 'available';

update public.products
set sku = coalesce(sku, upper(replace(id, '-', ''))),
    tail_type = coalesce(tail_type, species),
    gender = coalesce(gender, 'male'),
    admin_status = case
      when published = false then 'hidden'
      when stock_status = 'out_of_stock' then 'sold'
      else 'available'
    end;

alter table public.products alter column sku set not null;
create unique index if not exists products_sku_unique_idx on public.products (lower(sku));

do $$ begin
  alter table public.products add constraint products_gender_check
    check (gender in ('male', 'female', 'unsexed'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.products add constraint products_admin_status_check
    check (admin_status in ('draft', 'available', 'reserved', 'sold', 'hidden'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.products add constraint products_reserved_qty_check
    check (reserved_qty >= 0 and reserved_qty <= stock_qty);
exception when duplicate_object then null; end $$;

alter table public.orders
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_method text,
  add column if not exists transaction_reference text,
  add column if not exists shipping_status text not null default 'pending',
  add column if not exists shipping_provider text,
  add column if not exists tracking_number text,
  add column if not exists shipping_fee numeric(12,2) not null default 0,
  add column if not exists discount numeric(12,2) not null default 0;

do $$ begin
  alter table public.orders add constraint orders_payment_status_check
    check (payment_status in ('pending', 'paid', 'failed', 'refunded'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.orders add constraint orders_shipping_status_check
    check (shipping_status in ('pending', 'ready_to_ship', 'shipped', 'delivered', 'returned'));
exception when duplicate_object then null; end $$;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_name text not null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text,
  file_size bigint,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id text primary key default 'default',
  store_name text not null default 'Mini Betta Farm',
  description text,
  contact_phone text,
  contact_email text,
  line_id text,
  shipping_fee numeric(12,2) not null default 0,
  free_shipping_threshold numeric(12,2),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, store_name, description)
values ('default', 'Mini Betta Farm', 'Premium ornamental Betta Fish store')
on conflict (id) do nothing;

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists media_assets_created_at_idx on public.media_assets (created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

alter table public.activity_logs enable row level security;
alter table public.media_assets enable row level security;
alter table public.store_settings enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product media" on storage.objects;
create policy "Public can view product media" on storage.objects
for select to public using (bucket_id = 'product-media');

create or replace function public.admin_adjust_inventory(
  p_product_id text,
  p_delta integer,
  p_reason text,
  p_admin_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_new_stock integer;
begin
  if p_delta = 0 then raise exception 'Adjustment cannot be zero'; end if;
  select * into v_product from public.products where id = p_product_id for update;
  if not found then raise exception 'Product not found'; end if;
  v_new_stock := v_product.stock_qty + p_delta;
  if v_new_stock < 0 then raise exception 'Stock cannot be negative'; end if;
  if v_new_stock < v_product.reserved_qty then raise exception 'Stock cannot be below reserved quantity'; end if;

  update public.products
  set stock_qty = v_new_stock,
      stock_status = case
        when v_new_stock = 0 then 'out_of_stock'
        when v_new_stock <= 3 then 'low_stock'
        else 'in_stock'
      end,
      admin_status = case
        when admin_status in ('hidden', 'draft') then admin_status
        when v_new_stock = 0 then 'sold'
        when reserved_qty = v_new_stock and v_new_stock > 0 then 'reserved'
        else 'available'
      end,
      published = case
        when admin_status in ('hidden', 'draft') then false
        when v_new_stock = 0 then false
        else true
      end
  where id = p_product_id
  returning * into v_product;

  insert into public.inventory_logs (product_id, change_qty, reason)
  values (p_product_id, p_delta, coalesce(nullif(trim(p_reason), ''), 'admin_adjustment'));

  insert into public.activity_logs (admin_name, action, resource_type, resource_id, details)
  values (p_admin_name, 'inventory.adjust', 'product', p_product_id,
    jsonb_build_object('delta', p_delta, 'reason', p_reason, 'newStock', v_new_stock));

  return jsonb_build_object(
    'id', v_product.id,
    'stockQty', v_product.stock_qty,
    'stockStatus', v_product.stock_status,
    'adminStatus', v_product.admin_status
  );
end;
$$;

revoke all on function public.admin_adjust_inventory(text, integer, text, text) from public;
grant execute on function public.admin_adjust_inventory(text, integer, text, text) to service_role;
