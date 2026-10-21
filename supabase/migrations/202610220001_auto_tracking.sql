alter table public.orders
  add column if not exists tracking_status_code text,
  add column if not exists tracking_status_description text,
  add column if not exists tracking_checked_at timestamptz,
  add column if not exists tracking_delivery_notified_at timestamptz;

create index if not exists orders_shipped_tracking_idx
  on public.orders (id)
  where shipping_status = 'shipped' and tracking_number is not null;

create or replace function public.reset_order_tracking_on_number_change()
returns trigger language plpgsql as $$
begin
  if new.tracking_number is distinct from old.tracking_number then
    new.tracking_status_code := null;
    new.tracking_status_description := null;
    new.tracking_checked_at := null;
    new.tracking_delivery_notified_at := null;
  end if;
  return new;
end; $$;

drop trigger if exists orders_reset_tracking_on_number_change on public.orders;
create trigger orders_reset_tracking_on_number_change before update of tracking_number on public.orders
for each row execute function public.reset_order_tracking_on_number_change();

create or replace function public.record_order_tracking(
  p_order_id uuid,
  p_tracking_number text,
  p_status_code text,
  p_status_description text,
  p_delivered boolean
) returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status = 'cancelled'
    or v_order.shipping_status <> 'shipped'
    or v_order.tracking_number is distinct from p_tracking_number then
    return false;
  end if;

  update public.orders set
    tracking_status_code = p_status_code,
    tracking_status_description = p_status_description,
    tracking_checked_at = now(),
    shipping_status = case when p_delivered then 'delivered' else shipping_status end,
    status = case when p_delivered then 'completed' else status end,
    tracking_delivery_notified_at = case
      when p_delivered and line_user_id is not null then now()
      else tracking_delivery_notified_at end
  where id = p_order_id;

  return p_delivered;
end; $$;

revoke all on function public.record_order_tracking(uuid,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.record_order_tracking(uuid,text,text,text,boolean) to service_role;
