-- Create exactly one initial Owner, even if setup requests arrive concurrently.
create or replace function public.bootstrap_admin_owner(
  p_username text,
  p_password_hash text
) returns public.admin_users
language plpgsql security definer set search_path = public
as $$
declare
  v_user public.admin_users;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Unauthorized';
  end if;
  perform pg_advisory_xact_lock(620020, 20261020);
  if exists (select 1 from public.admin_users) then
    raise exception 'Admin setup is already complete';
  end if;
  if p_username !~ '^[A-Za-z0-9_.-]{3,40}$' or p_password_hash !~ '^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$' then
    raise exception 'Invalid initial owner';
  end if;
  insert into public.admin_users (username, password_hash, is_owner)
  values (p_username, p_password_hash, true)
  returning * into v_user;
  return v_user;
end;
$$;
revoke all on function public.bootstrap_admin_owner(text, text) from public, anon, authenticated;
grant execute on function public.bootstrap_admin_owner(text, text) to service_role;
