-- The same pair for Bible slides, and one number that is read in both modes.
--
-- Song text has been scalable since `lyrics_scaling`; a verse was always fitted,
-- on the grounds that a passage the operator did not choose the length of has
-- to fit. That holds for the fit, and not for the room: a wall whose text jumps
-- a size between John 3:16 and John 3:16-18 is the same distraction a song was,
-- and the answer is the same one — a held share of the screen height, which
-- means the same thing on any projector.
--
-- The size is now the ceiling while the text is being fitted, as it has always
-- been in the template editor: *this large, and smaller when the words need it*.
-- It stands in for the look's own cap rather than sitting under it, or the top
-- half of the slider would move nothing.
--
-- The defaults are where the fit was already landing on a 1080p projector — it
-- capped a song at 200px and a verse at 64px — written as a share of that
-- screen, so nobody's wall moves. `lyrics_size` is backfilled for the same
-- reason: rows that were scaling to fit never had theirs read, and reading it
-- now would resize text nobody had touched the setting for.
alter table public.settings
  add column verse_scale text not null default 'both',
  add column verse_size int not null default 6;

update public.settings set lyrics_size = 18 where lyrics_scale = 'both';
