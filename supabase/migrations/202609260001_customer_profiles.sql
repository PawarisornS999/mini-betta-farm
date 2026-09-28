-- Customer contact and default shipping address, securely keyed by verified LINE user ID.
create table if not exists public.customer_profiles (
  line_user_id text primary key,
  line_display_name text not null default '',
  line_picture_url text,
  customer_name text not null default '',
  customer_phone text not null default '',
  address_details text not null default '',
  province text not null default '',
  district text not null default '',
  subdistrict text not null default '',
  postal_code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_profiles_postal_code_check
    check (postal_code = '' or postal_code ~ '^[0-9]{5}$')
);

drop trigger if exists customer_profiles_set_updated_at on public.customer_profiles;
create trigger customer_profiles_set_updated_at before update on public.customer_profiles
for each row execute function public.set_updated_at();

alter table public.customer_profiles enable row level security;
revoke all on table public.customer_profiles from public, anon, authenticated;
grant select, insert, update on table public.customer_profiles to service_role;
