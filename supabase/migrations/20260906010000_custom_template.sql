-- The one slide layout the operator draws themselves: the ninth verse look.
--
-- A list of absolutely-placed elements — text carrying {{verses}} and friends,
-- shapes, and pictures — held as fractions of the frame so one stored template
-- comes out right on a projector, in the preview panel and in a settings tile.
-- A picture is identity only; the bytes stay in the operator's own browser and
-- reach an output over the same WebRTC path a background uses.
--
-- `{}` is what every existing row reads as, and means "the standard slide".
alter table public.settings
  add column if not exists custom_template jsonb not null default '{}'::jsonb;
