-- Require a server-verified LINE Login identity for every storefront order.
create or replace function public.place_order(
  p_customer_name text, p_customer_phone text, p_customer_address text,
  p_notes text, p_items jsonb, p_line_user_id text
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
     shipping_quoted, total_price, payment_status, reservation_expires_at, line_user_id)
  values
    (trim(p_customer_name), trim(p_customer_phone), nullif(trim(p_customer_address), ''),
     nullif(trim(p_notes), ''), v_total, v_shipping, true, v_total + v_shipping,
     'awaiting_slip', now() + interval '24 hours', trim(p_line_user_id))
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

-- Remove the former public five-argument checkout entry point so LINE identity
-- cannot be bypassed by calling PostgREST directly with the publishable key.
drop function if exists public.place_order(text, text, text, text, jsonb);
revoke all on function public.place_order(text,text,text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.place_order(text,text,text,text,jsonb,text) to service_role;
