-- The founding-price ladder: fifteen spots below the standard price.
--
-- The first ten churches pay $9 a month, the next five pay $14, and everyone
-- after that pays $19 — for as long as the subscription runs. The rate itself
-- is held by Dodo, because a subscription is bound to the product it was
-- created on; what this file holds is *which* spot a church took.
--
-- **A spot is a number stamped on a row, not a running total.** `founding_seat`
-- is taken once and never moves, so the count can only go up. Deriving the rung
-- from a live count of paying churches would walk the number backwards on every
-- cancellation, which reads as broken and is worth gaming. A church that leaves
-- has spent its spot.
--
-- The rungs themselves are not written here — `src/lib/billing/founding.ts` is
-- the one place that says what a seat number costs, and it is what picks the
-- Dodo product. This file only hands out the integers.

alter table public.subscriptions
  add column if not exists founding_seat int,
  -- When the seat was taken at checkout, cleared once the subscription is
  -- actually paying. A checkout that was opened and abandoned must not hold a
  -- $9 spot forever; a subscription that went through must not lose one.
  add column if not exists founding_reserved_at timestamptz;

create unique index if not exists subscriptions_founding_seat_key
  on public.subscriptions (founding_seat) where founding_seat is not null;

-- How long an unfinished checkout keeps the spot it took. Long enough to enter
-- a card and a billing address without being hurried, short enough that a
-- visitor who closed the tab is not counted against the ten.
create or replace function public.founding_hold() returns interval
language sql immutable as $$ select interval '30 minutes' $$;

-- Whether a seat is still standing: either the church is paying for it, or its
-- checkout is still open.
create or replace function public.founding_held(seat int, reserved_at timestamptz) returns boolean
language sql immutable as $$
  select seat is not null and (reserved_at is null or reserved_at > now() - public.founding_hold());
$$;

-- ------------------------------------------------------------- what the page reads

-- How many of the fifteen are gone, counting live reservations so the page
-- never offers a spot that is already in someone's checkout.
--
-- Security definer because `subscriptions` is readable only by its owner, and
-- this is a marketing page's number. It publishes one integer, which is the
-- integer we are printing on that page anyway.
create or replace function public.founding_claimed() returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int
  from public.subscriptions
  where public.founding_held(founding_seat, founding_reserved_at);
$$;

grant execute on function public.founding_claimed() to anon, authenticated;

-- ------------------------------------------------------------- taking a spot

-- Take the next seat for `uid`, and return it.
--
-- One statement, so two churches reaching checkout together cannot both be
-- quoted $9: the unique index on `founding_seat` is what settles the race, and
-- the loser retries onto the next number. An operator who already holds a seat
-- keeps it — pressing Upgrade twice must not move a church up the ladder or
-- burn a second spot.
--
-- **Not granted to anon or authenticated.** Anyone able to call this could take
-- a $9 seat without paying for it. It runs from `/api/billing/checkout` through
-- the service-role client, which has authorised the caller by their session.
create or replace function public.claim_founding_seat(uid uuid) returns int
language plpgsql security definer set search_path = public as $$
declare
  seat int;
  attempt int;
begin
  -- Hand back the spots on checkouts that were opened and abandoned. Cleared
  -- rather than merely ignored: the unique index does not know about the hold,
  -- so a stale row still standing on seat 7 would refuse the next church that
  -- earns it.
  update public.subscriptions
    set founding_seat = null, founding_reserved_at = null
    where founding_seat is not null
      and founding_reserved_at is not null
      and founding_reserved_at <= now() - public.founding_hold();

  -- Already holding one, whether paying for it or mid-checkout. Pressing
  -- Upgrade twice must not move a church up the ladder or burn a second spot;
  -- an open reservation gets its clock pushed out, a paid seat is left alone.
  update public.subscriptions
    set founding_reserved_at = case when founding_reserved_at is null then null else now() end
    where user_id = uid and founding_seat is not null
    returning founding_seat into seat;

  if seat is not null then return seat; end if;

  -- Otherwise the lowest number nobody is standing on. Lowest rather than
  -- max + 1, so a spot handed back above goes into the ten again rather than
  -- leaving a hole the page has already counted down.
  --
  -- The unique index is what settles a race between two churches reaching
  -- checkout together — they cannot both be quoted $9 — and the loser simply
  -- reads again and takes the next number.
  for attempt in 1..5 loop
    select n into seat
      from generate_series(1, 100000) as n
      where not exists (select 1 from public.subscriptions s where s.founding_seat = n)
      order by n limit 1;

    begin
      update public.subscriptions
        set founding_seat = seat, founding_reserved_at = now()
        where user_id = uid;

      return seat;
    exception when unique_violation then
      -- Taken between the read and the write. Read again.
    end;
  end loop;

  raise exception 'founding_seat_unavailable';
end;
$$;

revoke all on function public.claim_founding_seat(uuid) from public, anon, authenticated;
