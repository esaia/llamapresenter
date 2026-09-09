-- Whether a signed-in operator can reach /admin.
--
-- Lives on profiles rather than a separate table because there is nothing
-- else to say about an admin yet — just yes or no.
--
-- The existing "own profile" policy is `for all`, so without more an operator
-- could reach through their own session and flip this column to true. The
-- trigger below closes that: any update that isn't made by the service role
-- (the admin API routes, or a hand edit in the Supabase table editor) has its
-- is_admin silently pinned back to whatever it already was. That is the only
-- intended way this column ever changes.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.pin_is_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists pin_is_admin on public.profiles;
create trigger pin_is_admin
  before update on public.profiles
  for each row execute function public.pin_is_admin();
