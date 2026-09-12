---
type: index
---

# LlamaPresenter vault

The map of this vault. Everything reachable from here; nothing filed anywhere else.

Open `docs/vault` as an Obsidian vault (Open folder as vault) if you want the graph and
backlinks. Nothing here depends on the app — these are plain markdown files and
`[[wikilinks]]` by basename, readable on GitHub and in any editor.

## What lives where

| Where | Holds | Written by |
| --- | --- | --- |
| `Features/` | One note per shipped feature that involved a questionable choice | `/log-feature` |
| [[Backlog]] | Unfinished work, and a `## Shipped` log linking to notes | `/log-feature`, by hand |
| `_templates/feature.md` | The shape a feature note takes | by hand |
| `.ai/rules/` (outside the vault) | Traps that must fire *mid-edit*, not afterwards | by hand |

Read `README.md` for the architecture and `CLAUDE.md` for the working agreement. This vault
is neither — it records *why* a particular piece of work came out the way it did, in cases
where the diff alone would mislead.

## The bar

A note exists only when the work involved a choice a reasonable person would question.
Shipping a capability is not by itself a reason to write one. Content re-derivable from
`git show` is exactly the content that later goes stale, so it is cut rather than
shortened.

If the thing you want to record is actionable *while code is being edited* — "always do X
here", a non-obvious trap — it belongs in `.ai/rules`, not here. See
[[rules-vs-notes]] for which home to pick.

## Features

_Nothing logged yet._

## Links

- [[Backlog]]
- [[rules-vs-notes]]
