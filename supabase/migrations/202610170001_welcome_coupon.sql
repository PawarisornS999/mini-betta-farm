create table if not exists public.customer_welcome_coupons (
  line_user_id text primary key,
  code text not null default 'BETTA50',
  discount_percent numeric(5,2) not null default 50 check (discount_percent = 50),
  max_discount numeric(12,2) not null default 200 check (max_discount = 200),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  order_id uuid references public.orders(id) on delete set null
);

alter table public.customer_welcome_coupons enable row level security;
revoke all on public.customer_welcome_coupons from public, anon, authenticated;
grant select, insert, update on public.customer_welcome_coupons to service_role;

create or replace function public.grant_welcome_coupon(p_line_user_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_coupon public.customer_welcome_coupons%rowtype;
begin
  if nullif(trim(p_line_user_id), '') is null then
    raise exception 'LINE user is required';
  end if;

  -- Only customers without an existing LINE-linked order qualify.
  if not exists (
    select 1 from public.orders where line_user_id = trim(p_line_user_id)
  ) then
    insert into public.customer_welcome_coupons(line_user_id)
    values (trim(p_line_user_id))
    on conflict (line_user_id) do nothing;
  end if;

  select * into v_coupon
  from public.customer_welcome_coupons
  where line_user_id = trim(p_line_user_id);
  if not found then return null; end if;

  return jsonb_build_object(
    'code', v_coupon.code,
    'discountPercent', v_coupon.discount_percent,
    'maxDiscount', v_coupon.max_discount,
    'available', v_coupon.used_at is null,
    'usedAt', v_coupon.used_at
  );
end; $$;

-- Keep price lookup, stock reservation, discount and coupon redemption atomic.
drop function if exists public.place_order(text,text,text,text,jsonb,text);
create or replace function public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb,
  p_line_user_id text,
  p_use_welcome_coupon boolean
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_line record;
  v_product public.products%rowtype;
  v_item_price numeric(12,2);
  v_total numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_shipping numeric(12,2) := 80;
  v_today date := (now() at time zone 'Asia/Bangkok')::date;
  v_coupon public.customer_welcome_coupons%rowtype;
begin
  if nullif(trim(p_customer_name), '') is null or nullif(trim(p_customer_phone), '') is null then
    raise exception 'Customer name and phone are required';
  end if;
  if nullif(trim(p_line_user_id), '') is null then
    raise exception 'LINE user is required';
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

  for v_line in
    select item->>'productId' as product_id,
      sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as entry(item)
    group by item->>'productId' order by item->>'productId'
  loop
    select * into v_product from public.products
    where id = v_line.product_id and published = true and admin_status = 'available'
    for update;
    if not found then raise exception 'Product unavailable: %', v_line.product_id; end if;
    if v_product.stock_qty < v_line.quantity then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;
    v_item_price := case
      when v_product.sale_price is not null
        and v_product.sale_start_date <= v_today
        and v_product.sale_end_date >= v_today
      then v_product.sale_price else v_product.price end;
    v_total := v_total + v_item_price * v_line.quantity;
  end loop;

  if coalesce(p_use_welcome_coupon, false) then
    select * into v_coupon from public.customer_welcome_coupons
    where line_user_id = trim(p_line_user_id) and used_at is null
    for update;
    if not found then raise exception 'Welcome coupon is unavailable'; end if;
    v_discount := least(
      round(v_total * v_coupon.discount_percent / 100, 2),
      v_coupon.max_discount
    );
  end if;

  select shipping_fee into v_shipping
  from public.store_settings where id = 'default';
  v_shipping := coalesce(v_shipping, 80);

  insert into public.orders
    (customer_name, customer_phone, customer_address, notes, subtotal, shipping_fee,
     discount, shipping_quoted, total_price, payment_status, reservation_expires_at, line_user_id)
  values
    (trim(p_customer_name), trim(p_customer_phone), nullif(trim(p_customer_address), ''),
     nullif(trim(p_notes), ''), v_total, v_shipping, v_discount, true,
     v_total + v_shipping - v_discount, 'awaiting_slip', now() + interval '24 hours',
     trim(p_line_user_id))
  returning * into v_order;

  for v_line in
    select item->>'productId' as product_id,
      sum((item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as entry(item)
    group by item->>'productId' order by item->>'productId'
  loop
    select * into v_product from public.products where id = v_line.product_id;
    v_item_price := case
      when v_product.sale_price is not null
        and v_product.sale_start_date <= v_today
        and v_product.sale_end_date >= v_today
      then v_product.sale_price else v_product.price end;
    insert into public.order_items (order_id, product_id, product_name, price, quantity)
    values (v_order.id, v_product.id, v_product.name, v_item_price, v_line.quantity);
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

  if coalesce(p_use_welcome_coupon, false) and v_discount > 0 then
    update public.customer_welcome_coupons
    set used_at = now(), order_id = v_order.id
    where line_user_id = trim(p_line_user_id);
  end if;

  return jsonb_build_object(
    'id', v_order.id,
    'customerToken', v_order.customer_token,
    'customerName', v_order.customer_name,
    'customerPhone', v_order.customer_phone,
    'customerAddress', v_order.customer_address,
    'notes', v_order.notes,
    'subtotal', v_total,
    'shippingFee', v_shipping,
    'discount', v_discount,
    'shippingQuoted', true,
    'totalPrice', v_order.total_price,
    'paymentStatus', 'awaiting_slip',
    'status', v_order.status,
    'createdAt', v_order.created_at,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
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
      )), '[]'::jsonb)
      from public.order_items oi
      left join public.products p on p.id = oi.product_id
      where oi.order_id = v_order.id
    )
  );
end; $$;

revoke all on function public.grant_welcome_coupon(text) from public, anon, authenticated;
grant execute on function public.grant_welcome_coupon(text) to service_role;
revoke all on function public.place_order(text,text,text,text,jsonb,text,boolean) from public, anon, authenticated;
grant execute on function public.place_order(text,text,text,text,jsonb,text,boolean) to service_role;
