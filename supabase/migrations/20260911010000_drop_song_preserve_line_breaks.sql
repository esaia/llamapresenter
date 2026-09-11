-- The per-song version of this switch never shipped in the UI; the choice
-- lives on the lyrics template's own text box instead (`TextStyle.preserveLineBreaks`
-- in lib/projector/template.ts), which is a stored jsonb column, not a new one.
alter table public.songs
  drop column if exists preserve_line_breaks;
