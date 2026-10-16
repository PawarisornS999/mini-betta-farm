create table public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null,
  order_id uuid references public.orders(id) on delete set null,
  product_summary text not null,
  claimed_amount numeric(12,2) not null check (claimed_amount > 0),
  payment_reference text,
  customer_note text,
  admin_note text,
  reason text not null check (reason in ('stock_unavailable', 'order_problem')),
  status text not null default 'requested' check (status in ('requested', 'reviewing', 'refunded', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index refund_requests_order_unique on public.refund_requests(order_id)
  where order_id is not null;
create unique index refund_requests_open_no_order_unique on public.refund_requests(line_user_id)
  where order_id is null and status in ('requested', 'reviewing');
create index refund_requests_customer_created_idx on public.refund_requests(line_user_id, created_at desc);
create index refund_requests_status_created_idx on public.refund_requests(status, created_at desc);

create trigger refund_requests_set_updated_at before update on public.refund_requests
for each row execute function public.set_updated_at();

alter table public.refund_requests enable row level security;
revoke all on public.refund_requests from public, anon, authenticated;
grant select, insert, update on public.refund_requests to service_role;

create or replace function public.check_refund_order()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype;
begin
  if new.order_id is null then return new; end if;
  select * into v_order from public.orders where id = new.order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.line_user_id is distinct from new.line_user_id then
    raise exception 'Refund customer does not own order';
  end if;
  if v_order.shipping_status <> 'pending' then
    raise exception 'Shipped orders require separate review';
  end if;
  return new;
end; $$;

create trigger refund_requests_check_order before insert on public.refund_requests
for each row execute function public.check_refund_order();

create or replace function public.guard_order_during_refund()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from public.refund_requests where order_id = old.id) then
      raise exception 'Order has a refund record';
    end if;
    return old;
  end if;
  if current_setting('app.refund_transition', true) is distinct from 'allowed'
    and exists (select 1 from public.refund_requests
      where order_id = old.id and status in ('requested', 'reviewing')) then
    raise exception 'Order is under refund review';
  end if;
  return new;
end; $$;

create trigger orders_guard_during_refund before update or delete on public.orders
for each row execute function public.guard_order_during_refund();

create or replace function public.admin_open_order_refund(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_refund public.refund_requests%rowtype;
  v_summary text;
begin
  if auth.role() <> 'service_role' then raise exception 'Unauthorized'; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.line_user_id is null then raise exception 'Order has no LINE customer'; end if;
  if v_order.shipping_status <> 'pending' then raise exception 'Order has already shipped'; end if;
  if v_order.payment_status not in ('slip_submitted', 'paid') then
    raise exception 'Refund requires a submitted slip or confirmed payment';
  end if;
  if exists (select 1 from public.refund_requests where order_id = p_order_id) then
    raise exception 'Refund request already exists';
  end if;

  select coalesce(string_agg(product_name || ' × ' || quantity::text, ', '), 'Order items')
  into v_summary from public.order_items where order_id = p_order_id;
  insert into public.refund_requests
    (line_user_id, order_id, product_summary, claimed_amount, reason)
  values
    (v_order.line_user_id, p_order_id, v_summary, v_order.total_price, 'stock_unavailable')
  returning * into v_refund;
  perform set_config('app.refund_transition', 'allowed', true);
  update public.orders set status = 'cancelled' where id = p_order_id;
  return to_jsonb(v_refund);
end; $$;

create or replace function public.admin_update_refund(
  p_refund_id uuid, p_status text, p_admin_note text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_refund public.refund_requests%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'Unauthorized'; end if;
  select * into v_refund from public.refund_requests where id = p_refund_id for update;
  if not found then raise exception 'Refund request not found'; end if;
  if v_refund.status in ('refunded', 'rejected') then raise exception 'Refund request is closed'; end if;
  if p_status = 'reviewing' and v_refund.status <> 'requested' then
    raise exception 'Invalid refund status transition';
  elsif p_status = 'refunded' and v_refund.status <> 'reviewing' then
    raise exception 'Review the refund before marking it complete';
  elsif p_status = 'rejected' and v_refund.status <> 'requested' then
    raise exception 'Invalid refund status transition';
  elsif p_status not in ('reviewing', 'refunded', 'rejected') then
    raise exception 'Invalid refund status';
  end if;

  if p_status = 'reviewing' and v_refund.order_id is not null then
    if exists (select 1 from public.orders where id = v_refund.order_id
      and shipping_status <> 'pending') then
      raise exception 'Shipped orders require separate review';
    end if;
    perform set_config('app.refund_transition', 'allowed', true);
    -- A refund accepted for an unfulfilled order stops shipment. Stock remains
    -- reserved until the shop explicitly decides whether the fish can be sold.
    update public.orders set status = 'cancelled' where id = v_refund.order_id;
  end if;

  update public.refund_requests
  set status = p_status, admin_note = nullif(trim(p_admin_note), ''),
    resolved_at = case when p_status in ('refunded', 'rejected') then now() else null end
  where id = p_refund_id returning * into v_refund;

  if p_status = 'refunded' and v_refund.order_id is not null then
    perform set_config('app.refund_transition', 'allowed', true);
    update public.orders set status = 'cancelled', payment_status = 'refunded'
    where id = v_refund.order_id;
  end if;
  return to_jsonb(v_refund);
end; $$;

revoke all on function public.admin_update_refund(uuid,text,text) from public, anon, authenticated;
grant execute on function public.admin_update_refund(uuid,text,text) to service_role;
revoke all on function public.admin_open_order_refund(uuid) from public, anon, authenticated;
grant execute on function public.admin_open_order_refund(uuid) to service_role;

notify pgrst, 'reload schema';
