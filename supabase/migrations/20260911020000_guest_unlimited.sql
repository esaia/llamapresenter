-- A guest (anonymous sign-in) can never walk off with a plan ceiling: `/show`
-- and `/lower3rd` are the only durable outputs, and `AppBar.tsx` already
-- refuses a guest the shareable link that would put either in front of a
-- congregation. With that door shut, a Free ceiling on a demo room buys
-- nothing but a confusing "full" badge mid-trial — so a guest is treated as
-- Pro here exactly as the console's `effectivePlan` in
-- `src/lib/billing/entitlements.ts` now does.

create or replace function public.plan_ceiling(uid uuid, key text) returns int
language sql stable security definer set search_path = public as $$
  select case
    when not public.gates_enforced() then null
    when public.plan_of(uid) = 'pro' then null
    when coalesce((select is_anonymous from auth.users where id = uid), false) then null
    else public.free_limit(key)
  end;
$$;
