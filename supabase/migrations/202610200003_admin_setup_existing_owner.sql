-- Mark setup completion so a one-time setup token can replace an old env-created Owner.
alter table public.admin_users add column if not exists setup_completed boolean not null default false;

create or replace function public.complete_admin_setup(
  p_username text,
  p_password_hash text
) returns public.admin_users
language plpgsql security definer set search_path = public
as $$
declare
  v_user public.admin_users;
  v_count integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Unauthorized';
  end if;
  perform pg_advisory_xact_lock(620020, 20261020);
  if p_username !~ '^[A-Za-z0-9_.-]{3,40}$' or p_password_hash !~ '^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$' then
    raise exception 'Invalid initial owner';
  end if;
  select count(*) into v_count from public.admin_users;
  if v_count = 0 then
    insert into public.admin_users (username, password_hash, is_owner, setup_completed)
    values (p_username, p_password_hash, true, true)
    returning * into v_user;
  elsif v_count = 1 then
    update public.admin_users
    set username = p_username,
        password_hash = p_password_hash,
        setup_completed = true,
        session_version = session_version + 1,
        last_login_at = null,
        updated_at = now()
    where is_owner and is_active and not setup_completed
    returning * into v_user;
    if v_user.id is null then raise exception 'Admin setup is already complete'; end if;
  else
    raise exception 'Admin setup is already complete';
  end if;
  return v_user;
end;
$$;
revoke all on function public.complete_admin_setup(text, text) from public, anon, authenticated;
grant execute on function public.complete_admin_setup(text, text) to service_role;
