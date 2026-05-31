# Pros/Cons slide type — design note

**Date:** 2026-05-31
**Status:** Shipped to template

## Context

Decks frequently present a trade-off (build vs. buy, risks vs. benefits, for vs.
against). Until now those landed as a plain bulleted list or got forced into the
`architecture` two-card *side-by-side* comparison, where pros and cons read as
peers rather than as opposing sides. Leo asked that trade-offs be split into two
cards — **above and below** — with contrasting backgrounds so the two sides are
instantly identifiable.

## Decision

Add a dedicated `proscons` slide type: a standard slide header (`slide_label` ·
`title` · `subtitle`) over two full-width panels stacked vertically, each filling
half the content area.

**Contrast treatment: tonal light/dark** (chosen over semantic green/red and over
accent/muted). Pros = a light raised panel on top; cons = an inverted dark panel
below. This stays inside the restrained theme system — no green/red "dashboard"
look — while still being unmistakable at a glance.

## Content schema

```yaml
type: proscons
slide_label: 05 / Trade-offs
title: Build the renderer in-house?
subtitle: One-line framing of the decision.
pros: [First advantage., Second advantage., Third advantage.]
cons: [First drawback., Second drawback.]
pros_label: Pros          # optional, default "Pros"
cons_label: Cons          # optional, default "Cons"
footer: Optional one-line takeaway / recommendation.   # optional
```

Items render as a two-column list inside each wide panel (the panels are wide and
short, so a single column would waste horizontal space).

## Theming approach

The markup never changes per theme — the same rule as every other slide type.
Contrast is driven by four CSS custom properties resolved per theme:

- `--pc-pro-bg`, `--pc-pro-ink`, `--pc-pro-accent`
- `--pc-con-bg`, `--pc-con-ink`, `--pc-con-accent`

Defaults live in `:root` and resolve correctly for the five light themes
(pro = `--card`, con = inverted `--text`). The dark/glass/stark themes override:

- **Carbon / Dusk** — pro becomes a bright off-white/lavender panel; con a deep
  near-black panel, both tied to the theme accent.
- **Aurora** — pro = brighter frosted glass, con = darker frosted glass, keeping
  the backdrop blur so the glass aesthetic survives.
- **Brutalist** — pure white pro with a 2px black border, solid black con with a
  chartreuse label; sharp corners, no shadow.

`.pc-card` is wired into the existing per-theme card overrides and the Present-mode
entrance cascade, so motion and per-theme structure come for free.

## Standing rule

`SKILL.md` now mandates: whenever a deck presents a trade-off, use `proscons`
(pros in the light card on top, cons in the dark card below) rather than a plain
bulleted list.

## Verification

Rendered the sample slide full-bleed across Terracotta, Carbon, Brutalist, Aurora,
and Dusk. Light/dark split reads clearly on every theme; the optional footer and
page number render in Review mode and PDF export. Note: with Brutalist's oversized
Archivo Black display font a long title wraps to two lines and crowds the fixed
`top: 220px` content region — a pre-existing trait shared by all content slide
types, mitigated here by keeping the sample title short.
