# claude-skills

Personal Claude Code skills. Each subdirectory is a skill that can be loaded by
the `Skill` tool when working with Claude Code.

**Current release: [v1.5.0](https://github.com/LeoHChen/claude-skills/releases/tag/v1.5.0)** — see "What's new" below or the full [release notes](https://github.com/LeoHChen/claude-skills/releases/tag/v1.5.0).

## Skills

| Skill | What it does |
| --- | --- |
| [`build-deck`](build-deck/) | Themed website-rendered slide deck from a `content.md` YAML stream. **Dual-mode renderer** — Review (scroll) for editing, Present (one slide fills viewport) for delivery. Present mode adds a top progress hairline, floating bottom nav (`‹ Prev   NN / MM   Next ›`, fades on idle), and keyboard nav (`← / → / Space / Home / End / Esc`). On-slide page numbers visible in both modes and in PDF export. **Self-contained scaffold** — each deck folder now ships with its own `Makefile`, and `make sync` bakes `content.md` into `index.html`. **8 themes** with distinct typography, slide chrome, and motion signatures: Terracotta, Carbon, Berry, Lab, Mono, Aurora, Brutalist, Dusk. **Motion in Present mode** — slide transitions (Fade / Slide / Zoom / Cut, per-theme defaults, user-override topbar selector), element entrance cascade, per-theme background motion (Aurora gradient drift, Mono pulse, Carbon scanline, Berry vignette breathe, Terracotta paper grain). All CSS-only, gated by `prefers-reduced-motion`. Slide types: `title`, `architecture`, `cards` (paragraph `body` or `bullets[]`), `flow`, `roadmap`, `questions`, `proscons` (trade-off slide — pros in a light card, cons in a dark card; add `options[]` for a multi-option comparison grid). Export-PDF works from both modes. |
| [`weekly-all-hands`](weekly-all-hands/) | Creates and updates Poseidon weekly all-hands transcript imports, meeting notes, TL;DR sections, and next-week carry-forward agendas after a Granola transcript is posted. Includes a scaffold script for the standard `tpm-agent` meeting files. |
| [`write-doc`](write-doc/) | Write a Markdown document and render it to themed HTML and PDF via `make sync DOC=<name> [THEME=<theme>]` and `make pdf DOC=<name> [THEME=<theme>]`. Themes: Terracotta, Carbon, Berry, Lab, CV — tuned for print. Pandoc + headless Chromium pipeline (no LaTeX). |
| [`nano-banana`](nano-banana/) | Generate or edit images via Google's Gemini "Nano Banana" image-model family. Stdlib-only Python CLI; defaults to `gemini-3.1-flash-image-preview`, with Pro tier via `--model nano-banana-pro-preview` and stable fallback `gemini-2.5-flash-image`. Supports text-to-image, image edit, and multi-reference composition (repeat `--input`). Requires `GEMINI_API_KEY`. |

## What's new in v1.5.0

**`build-deck` bulleted cards** — the `cards` slide type now takes an optional `bullets[]` array per card, rendering a scannable bulleted list instead of a paragraph `body`.

- `body` stays optional; bullet markers follow the card accent (primary/accent), and dense mode shrinks the bullet font.
- Turns crowded multi-clause cards (intros, per-product challenge breakdowns) into clean, scannable bullets.

Issue #17 / PR #18.

Full notes: [v1.5.0 release](https://github.com/LeoHChen/claude-skills/releases/tag/v1.5.0).

## What's new in v1.4.0

**`build-deck` proscons grid subtype** — `proscons` now compares several options that each carry their own pros and cons.

- Add an `options[]` array and `proscons` renders **N side-by-side split cards** — each option a light PROS zone over a dark CONS zone, with a `title` / `role` header and an optional `accent` ring on the leading option.
- Reuses the same `--pc-*` tonal variables; wired into the per-theme card overrides (Aurora glass, Brutalist sharp) and the Present-mode entrance cascade, so it adapts across all 8 themes.
- Absent `options`, the original single stacked pros/cons layout is unchanged.

Design note in [`build-deck/docs/`](build-deck/docs/). Issue #15 / PR #16.

Full notes: [v1.4.0 release](https://github.com/LeoHChen/claude-skills/releases/tag/v1.4.0).

## What's new in v1.3.0

**`build-deck` pros/cons + type scale** — a new slide type plus design-review refinements to the renderer.

- **New `proscons` slide type** — trade-offs render as two stacked, contrasting panels: pros in a light raised card (top), cons in an inverted dark card (bottom). Tonal contrast (no green/red) driven by theme-aware `--pc-*` variables, with tuned overrides for Carbon, Dusk, Aurora (glass), and Brutalist so it adapts across all 8 themes. Optional `pros_label` / `cons_label` / `footer`.
- **Type scale** — smaller hero title (`clamp(96–152px)` → `clamp(68–108px)`), larger vision line (18 → 23px), and +1.5px body text across every slide type.
- **Roadmap** — renamed the `subnets` field and "SUBNETS / SCOPE" label to `scope` / "SCOPE" (drops Poseidon-specific jargon from the generic template).
- Fixed stale "4 themes" references in the skill doc (the renderer has 8).

Design doc in [`build-deck/docs/`](build-deck/docs/). Issue #13 / PR #14.

Full notes: [v1.3.0 release](https://github.com/LeoHChen/claude-skills/releases/tag/v1.3.0).

## What's new in v1.2.0

**`nano-banana`** — new skill that wraps Google's Gemini image-generation API (Nano Banana family) so Claude / Claude Code can generate or edit images programmatically from any session.

- Stdlib-only Python CLI — no `requests`, no `google-genai` dependency.
- Defaults to `gemini-3.1-flash-image-preview` (newest flash-tier image model). Pro tier via `--model nano-banana-pro-preview`; stable fallback `gemini-2.5-flash-image`.
- Supports text-to-image, image edit, and multi-reference composition (repeat `--input ref.png`).
- Documented model catalog + the `gemini-3.5-flash` text-only gotcha (returns `NO_IMAGE`).
- Requires `GEMINI_API_KEY` in env (get one at https://aistudio.google.com/apikey).

Issue #11 / PR #12.

Full notes: [v1.2.0 release](https://github.com/LeoHChen/claude-skills/releases/tag/v1.2.0).

## What's new in v1.1.0

**`build-deck` motion** — a three-layer motion system in Present mode. All CSS-only, no new dependencies, fully gated by `prefers-reduced-motion`.

- **Slide transitions** — Fade / Slide / Zoom / Cut, with per-theme defaults and a user-override topbar selector. Brutalist defaults to `cut` (no motion is the statement). State persists to `localStorage.deck-transition`.
- **Element entrance cascade** — when a slide becomes current, title / subtitle / cards / pillars / flow nodes stagger in over ~500ms. Brutalist and Lab deliberately opt out.
- **Per-theme background motion** — Aurora gradient hue-drift (20s loop), Mono dotted-grid pulse on slide change, Carbon scanline drift, Berry vignette breathe, Terracotta paper grain texture. Brutalist and Lab are deliberately static.

Design doc, implementation plan, and Issue #5 / PR #6 are in [`build-deck/docs/`](build-deck/docs/) and on GitHub.

Full notes: [v1.1.0 release](https://github.com/LeoHChen/claude-skills/releases/tag/v1.1.0).

## What's new in v1.0.0

**`build-deck` v2** — major upgrade from scroll-only to a presentation-grade renderer:

- Dual-mode (Review / Present) with persisted state.
- Top progress hairline, floating bottom nav, on-slide page numbers.
- Keyboard navigation in Present mode.
- 4 new themes — **Mono** (cyan + monospaced titles + dotted bar), **Aurora** (violet→teal gradient + glass cards + light-weight titles), **Brutalist** (Archivo Black ALL CAPS + 3px frame), **Dusk** (plum-dark + italic serif hero).
- Theme chip row replaced by a dropdown (scales to N themes).
- Each theme now varies in typography and slide chrome, not just palette.
- Bug fix: a duplicated `[data-theme="terracotta"]` CSS selector was silently applying Carbon's tokens to the Terracotta theme.

Full notes: [v1.0.0 release](https://github.com/LeoHChen/claude-skills/releases/tag/v1.0.0).

## Install on a new machine

```bash
git clone git@github.com:LeoHChen/claude-skills.git ~/projects/claude-skills

# Symlink each skill into ~/.claude/skills/ so Claude Code can discover it:
mkdir -p ~/.claude/skills
for s in ~/projects/claude-skills/*/; do
  name=$(basename "$s")
  ln -sfn "$s" ~/.claude/skills/"$name"
done
```

## Adding a new skill

1. Create a folder at the repo root, e.g. `my-skill/`.
2. Add a `SKILL.md` with YAML frontmatter (`name`, `description`).
3. Optionally include a `template/` or supporting files.
4. Symlink into `~/.claude/skills/<name>` if not already covered by the loop above.
5. Commit and push.

## Structure of a skill

```
<skill-name>/
├── SKILL.md          # frontmatter + instructions Claude reads
├── template/         # optional starter files copied during scaffolding
└── ...               # any other supporting assets
```

The frontmatter must include:

```yaml
---
name: <skill-name>
description: <when Claude should invoke this skill>
---
```
