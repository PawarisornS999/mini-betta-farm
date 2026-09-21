create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text unique,
  price numeric(12,2) not null check (price >= 0),
  original_price numeric(12,2) check (original_price is null or original_price >= price),
  description text not null default '',
  species text not null,
  color text not null,
  difficulty_level text check (difficulty_level in ('beginner', 'medium', 'advanced')),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  stock_status text not null default 'out_of_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  water_temp_min numeric(4,1),
  water_temp_max numeric(4,1),
  water_temp text,
  feeding_notes text not null default '',
  images text[] not null default '{}',
  badge text,
  featured boolean not null default false,
  published boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_image text not null,
  category text not null,
  tags text[] not null default '{}',
  author text not null,
  read_time text not null,
  related_slugs text[] not null default '{}',
  published boolean not null default true,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  notes text,
  total_price numeric(12,2) not null check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  price numeric(12,2) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) generated always as (price * quantity) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  change_qty integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists products_published_idx on public.products (published, created_at desc);
create index if not exists products_species_idx on public.products (species);
create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists inventory_logs_product_id_idx on public.inventory_logs (product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
begin
  if nullif(trim(p_customer_name), '') is null or nullif(trim(p_customer_phone), '') is null then
    raise exception 'Customer name and phone are required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product
    from public.products
    where id = v_item->>'productId' and published = true
    for update;

    if not found then
      raise exception 'Product not found: %', v_item->>'productId';
    end if;
    if v_product.stock_qty < v_quantity then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;
    v_total := v_total + (v_product.price * v_quantity);
  end loop;

  insert into public.orders (customer_name, customer_phone, customer_address, notes, total_price)
  values (trim(p_customer_name), trim(p_customer_phone), nullif(trim(p_customer_address), ''), nullif(trim(p_notes), ''), v_total)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = v_item->>'productId';

    insert into public.order_items (order_id, product_id, product_name, price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_quantity);

    update public.products
    set stock_qty = stock_qty - v_quantity,
        stock_status = case
          when stock_qty - v_quantity <= 0 then 'out_of_stock'
          when stock_qty - v_quantity <= 3 then 'low_stock'
          else 'in_stock'
        end
    where id = v_product.id;

    insert into public.inventory_logs (product_id, order_id, change_qty, reason)
    values (v_product.id, v_order_id, -v_quantity, 'customer_order');
  end loop;

  return (
    select jsonb_build_object(
      'id', o.id,
      'customerName', o.customer_name,
      'customerPhone', o.customer_phone,
      'customerAddress', o.customer_address,
      'notes', o.notes,
      'totalPrice', o.total_price,
      'status', o.status,
      'createdAt', o.created_at,
      'items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', oi.id,
          'productId', oi.product_id,
          'productName', oi.product_name,
          'price', oi.price,
          'quantity', oi.quantity,
          'product', jsonb_build_object(
            'id', oi.product_id,
            'name', oi.product_name,
            'price', oi.price,
            'images', coalesce(p.images, '{}')
          )
        ))
        from public.order_items oi
        left join public.products p on p.id = oi.product_id
        where oi.order_id = o.id
      ), '[]'::jsonb)
    )
    from public.orders o where o.id = v_order_id
  );
end;
$$;

alter table public.products enable row level security;
alter table public.blog_posts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_logs enable row level security;

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products" on public.products
for select to anon, authenticated using (published = true);

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts" on public.blog_posts
for select to anon, authenticated using (published = true);

revoke all on function public.place_order(text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, jsonb) to anon, authenticated;

