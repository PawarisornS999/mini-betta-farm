create table if not exists public.customer_wishlist (
  line_user_id text not null,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (line_user_id, product_id)
);

create index if not exists customer_wishlist_line_user_created_idx
  on public.customer_wishlist (line_user_id, created_at desc);

alter table public.customer_wishlist enable row level security;
revoke all on table public.customer_wishlist from public, anon, authenticated;
grant select, insert, update, delete on table public.customer_wishlist to service_role;
