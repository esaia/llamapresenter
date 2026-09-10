-- A fresh operator's song slides start centered.
--
-- Verse alignment stays left (a passage reads as a paragraph), but lyrics are
-- short, sung lines and read better centered — the look most churches already
-- pick by hand. `stream_lyrics_align` is left alone: its own default is '',
-- which already falls back to `lyrics_align` — see `fromRow` in
-- `lib/studio/settings.ts` — so changing this one column covers both the
-- projector and the stream.
--
-- Only new rows get this default; an operator who already chose left keeps it.

alter table public.settings alter column lyrics_align set default 'center';
