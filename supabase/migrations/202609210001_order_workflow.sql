-- Single-store checkout, manual shipping quote and LINE payment workflow.
alter table public.orders
  add column if not exists subtotal numeric(12,2),
  add column if not exists shipping_quoted boolean not null default false,
  add column if not exists customer_token uuid not null default gen_random_uuid(),
  add column if not exists line_user_id text,
  add column if not exists slip_path text,
  add column if not exists slip_submitted_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists reservation_expires_at timestamptz;

alter table public.store_settings
  add column if not exists payment_bank text,
  add column if not exists payment_account_name text,
  add column if not exists payment_account_number text,
  add column if not exists payment_promptpay_number text;
update public.store_settings set
  shipping_fee = 80,
  payment_bank = coalesce(payment_bank, 'TTB'),
  payment_account_name = coalesce(payment_account_name, 'ปวริศร ทรงถาวรทวี'),
  payment_account_number = coalesce(payment_account_number, '6342229520'),
  payment_promptpay_number = coalesce(payment_promptpay_number, '0958137613')
where id = 'default';

update public.orders
set subtotal = greatest(total_price - shipping_fee + discount, 0)
where subtotal is null;
alter table public.orders alter column subtotal set not null;
create unique index if not exists orders_customer_token_idx on public.orders(customer_token);

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'awaiting_slip', 'slip_submitted', 'paid', 'rejected', 'failed', 'refunded'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-slips', 'payment-slips', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create or replace function public.place_order(
  p_customer_name text, p_customer_phone text, p_customer_address text,
  p_notes text, p_items jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_line record;
  v_product public.products%rowtype;
  v_total numeric(12,2) := 0;
  v_shipping numeric(12,2) := 80;
begin
  if nullif(trim(p_customer_name), '') is null or nullif(trim(p_customer_phone), '') is null then
    raise exception 'Customer name and phone are required';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_items) as entry(item)
    where jsonb_typeof(item) <> 'object'
      or item->>'productId' is null
      or coalesce(item->>'quantity', '') !~ '^[1-9][0-9]*$'
  ) then raise exception 'Invalid order items'; end if;

  -- Lock products in a stable order and aggregate repeated IDs before checking stock.
  for v_line in
    select item->>'productId' as product_id, sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as entry(item)
    group by item->>'productId' order by item->>'productId'
  loop
    select * into v_product from public.products
    where id = v_line.product_id and published = true and admin_status = 'available'
    for update;
    if not found then raise exception 'Product unavailable: %', v_line.product_id; end if;
    if v_product.stock_qty < v_line.quantity then raise exception 'Insufficient stock for %', v_product.name; end if;
    v_total := v_total + v_product.price * v_line.quantity;
  end loop;

  select shipping_fee into v_shipping from public.store_settings where id = 'default';
  v_shipping := coalesce(v_shipping, 80);
  insert into public.orders
    (customer_name, customer_phone, customer_address, notes, subtotal, shipping_fee,
     shipping_quoted, total_price, payment_status, reservation_expires_at)
  values
    (trim(p_customer_name), trim(p_customer_phone), nullif(trim(p_customer_address), ''),
     nullif(trim(p_notes), ''), v_total, v_shipping, true, v_total + v_shipping,
     'awaiting_slip', now() + interval '24 hours')
  returning * into v_order;

  for v_line in
    select item->>'productId' as product_id, sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as entry(item)
    group by item->>'productId' order by item->>'productId'
  loop
    select * into v_product from public.products where id = v_line.product_id;
    insert into public.order_items (order_id, product_id, product_name, price, quantity)
    values (v_order.id, v_product.id, v_product.name, v_product.price, v_line.quantity);
    update public.products set
      stock_qty = stock_qty - v_line.quantity,
      stock_status = case when stock_qty - v_line.quantity = 0 then 'out_of_stock'
                          when stock_qty - v_line.quantity <= 3 then 'low_stock' else 'in_stock' end,
      admin_status = case when stock_qty - v_line.quantity = 0 then 'reserved' else admin_status end,
      published = case when stock_qty - v_line.quantity = 0 then false else published end
    where id = v_product.id;
    insert into public.inventory_logs (product_id, order_id, change_qty, reason)
    values (v_product.id, v_order.id, -v_line.quantity, 'order_reserved');
  end loop;

  return jsonb_build_object(
    'id', v_order.id, 'customerToken', v_order.customer_token,
    'customerName', v_order.customer_name, 'customerPhone', v_order.customer_phone,
    'customerAddress', v_order.customer_address, 'notes', v_order.notes,
    'subtotal', v_total, 'shippingFee', v_shipping, 'shippingQuoted', true,
    'totalPrice', v_order.total_price, 'paymentStatus', 'awaiting_slip', 'status', v_order.status,
    'createdAt', v_order.created_at,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
      'id', oi.id, 'productId', oi.product_id, 'productName', oi.product_name,
      'price', oi.price, 'quantity', oi.quantity,
      'product', jsonb_build_object('id', oi.product_id, 'name', oi.product_name,
        'price', oi.price, 'images', coalesce(p.images, '{}'))
    )), '[]'::jsonb) from public.order_items oi
      left join public.products p on p.id = oi.product_id where oi.order_id = v_order.id)
  );
end; $$;

-- All order edits use one locked transaction to keep totals, payment and stock consistent.
create or replace function public.admin_update_order(
  p_order_id uuid, p_action text, p_value text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_fee numeric(12,2);
begin
  if auth.role() <> 'service_role' then raise exception 'Unauthorized'; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if p_action = 'quote_shipping' then
    if v_order.status = 'cancelled' or v_order.payment_status = 'paid' then raise exception 'Order cannot be quoted'; end if;
    if p_value is null or p_value !~ '^[0-9]+(\.[0-9]{1,2})?$' then raise exception 'Invalid shipping fee'; end if;
    v_fee := p_value::numeric(12,2);
    update public.orders set shipping_fee = v_fee, shipping_quoted = true,
      total_price = subtotal + v_fee - discount, payment_status = 'awaiting_slip'
    where id = p_order_id;
  elsif p_action = 'paid' then
    if v_order.status = 'cancelled' or not v_order.shipping_quoted or v_order.payment_status <> 'slip_submitted' or v_order.slip_path is null then
      raise exception 'Slip must be submitted before confirming payment';
    end if;
    update public.orders set payment_status = 'paid', paid_at = now(), status = 'processing'
    where id = p_order_id;
    update public.products p set admin_status = 'sold'
      where p.stock_qty = 0 and p.admin_status = 'reserved'
      and exists (select 1 from public.order_items oi where oi.order_id = p_order_id and oi.product_id = p.id);
  elsif p_action = 'reject_slip' then
    if v_order.status = 'cancelled' or v_order.payment_status <> 'slip_submitted' then raise exception 'Payment cannot be rejected'; end if;
    update public.orders set payment_status = 'rejected' where id = p_order_id;
  elsif p_action = 'ready_to_ship' or p_action = 'shipped' or p_action = 'delivered' then
    if v_order.payment_status <> 'paid' then raise exception 'Payment is not confirmed'; end if;
    if (p_action = 'shipped' and v_order.shipping_status not in ('ready_to_ship','shipped'))
      or (p_action = 'delivered' and v_order.shipping_status <> 'shipped') then
      raise exception 'Invalid shipping transition';
    end if;
    update public.orders set shipping_status = p_action,
      status = case when p_action = 'shipped' then 'shipped'
                    when p_action = 'delivered' then 'completed' else status end
    where id = p_order_id;
  elsif p_action = 'tracking' then
    if v_order.payment_status <> 'paid' or nullif(trim(p_value), '') is null then raise exception 'Tracking number unavailable'; end if;
    update public.orders set tracking_number = trim(p_value) where id = p_order_id;
  elsif p_action = 'cancel' then
    if p_value = 'expired' and (v_order.reservation_expires_at is null or v_order.reservation_expires_at > now()
      or v_order.payment_status not in ('pending','awaiting_slip','rejected')) then
      raise exception 'Order is not eligible for expiry';
    end if;
    if v_order.payment_status = 'paid' or v_order.shipping_status <> 'pending' then
      raise exception 'Paid or shipping orders require a manual refund review';
    end if;
    if v_order.status = 'cancelled' then raise exception 'Order already cancelled'; end if;
    update public.orders set status = 'cancelled' where id = p_order_id;
    for v_item in select product_id, sum(quantity)::integer as quantity from public.order_items
      where order_id = p_order_id and product_id is not null group by product_id order by product_id
    loop
      update public.products set
        stock_qty = stock_qty + v_item.quantity,
        stock_status = case when stock_qty + v_item.quantity <= 3 then 'low_stock' else 'in_stock' end,
        admin_status = case when admin_status in ('reserved','sold') then 'available' else admin_status end,
        published = case when admin_status in ('reserved','sold') then true else published end
      where id = v_item.product_id;
      insert into public.inventory_logs (product_id, order_id, change_qty, reason)
      values (v_item.product_id, p_order_id, v_item.quantity, 'order_cancelled');
    end loop;
  else raise exception 'Invalid order action'; end if;
  return (select to_jsonb(o) from public.orders o where o.id = p_order_id);
end; $$;

revoke all on function public.admin_update_order(uuid,text,text) from public, anon, authenticated;
grant execute on function public.admin_update_order(uuid,text,text) to service_role;
