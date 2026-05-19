---
name: build-deck
description: Build a slide deck using the user's standard pattern — content lives in content.md (YAML stream), rendering is a themed website with a dual-mode (Review / Present) renderer, 8 themes (Terracotta, Carbon, Berry, Lab, Mono, Aurora, Brutalist, Dusk), keyboard nav in Present mode, top progress hairline, on-slide page numbers. Use when the user asks to build, design, draft, or revise a slide deck or presentation in any project. Each deck lives in its own subfolder with content.md, index.html, and sync.js. Avoid PowerPoint/PPTX unless the user explicitly asks.
---

# Build a Deck (User's Standard Pattern)

Whenever the user asks to build, design, or revise a deck or presentation, follow this pattern. Do not generate `.pptx`, `.key`, or static images unless the user explicitly asks for that format.

## File layout

Each deck is one self-contained subfolder:

```
{project}/
├── Makefile               # if present, prefer `make` targets
├── {deck-name}/
│   ├── content.md         # YAML stream — single source of truth
│   ├── index.html         # themed renderer (4 themes)
│   └── sync.js            # bakes content.md into the inline block
└── {another-deck}/        # one folder per deck
```

Template files live at `~/.claude/skills/build-deck/template/`. Copy them into the new deck folder and edit `content.md`.

## content.md format

Multi-document YAML stream. Each slide is one document, separated by `---`. The `.md` extension is intentional even though the format is YAML.

Available slide types:

| type | use for | key fields |
| --- | --- | --- |
| `title` | hero opener | `title`, `subtitle`, `vision`, `pillars[3]`, `footer` |
| `architecture` | two-card comparison | `cards[2]` each with `tag`, `accent`, `title`, `function_*`, `challenge_*` |
| `cards` | N-up grid (principles, user classes, action items) | `columns: 2|3`, optional `dense: true`, `cards[]` with `num`, `title`, `role`, `body`. Optional `footer` and `footer_emphasis: true` |
| `flow` | horizontal pipeline (frameworks, state machines) | `nodes[4-5]` each with `letter`, `name`, `desc`, optional `tag` |
| `roadmap` | 3-phase timeline with dependencies block | `phases[3]` with `date`, `status`, `title`, `objective`, `subnets`, `deps_label`, `deps`. Plus `primary_objective`, `phase1_metrics` |
| `questions` | 3×2 grid of open-question cards | `subtitle`, optional `note` (rendered as a pill), `questions[]` with `num`, `headline`, `body` |

See `~/.claude/skills/build-deck/template/content.md` for an example covering every type.

## Themes (do not invent new ones casually)

Built into `index.html` as CSS-variable swaps. User picks from a topbar dropdown. Markup never changes.

- **Terracotta** — warm cream + terracotta + forest green; serif display. Default. Warm/strategic.
- **Carbon** — premium dark with electric lime + warm orange. Technical/fundraising.
- **Berry** — cream + berry + dusty rose; serif display. Editorial.
- **Lab** — minimal off-white with magenta + mint-teal. Product/clinical.
- **Mono** — pure white + cyan accents; sans display, hairline borders. Modern tech/product.
- **Aurora** — violet→teal gradient bg with glass cards; lavender + mint accents. Vision/future decks.
- **Brutalist** — stark white + black + chartreuse; thick 2px rules, sharp corners, no shadows. Manifestos, conviction pieces.
- **Dusk** — plum-dark + lavender + peach; serif display. Premium dark without navy.

**Never default to deep blue** — the user has explicitly rejected that aesthetic. Pick a default that matches the deck's mood.

## Presentation Mode

The deck has two modes, toggled in the topbar:

- **Review** (default for editing) — all slides stacked vertically. Use for drafting and review.
- **Present** — one slide fills the viewport. Use for delivery.

State persists per browser via `localStorage.deck-mode`.

### Present mode chrome

- **Progress hairline** at the top of the viewport. Width reflects (current+1)/total.
- **Floating nav bar** at bottom-center: `‹ Prev   NN / MM   Next ›`. Fades after 2s of mouse idle, reappears on movement.
- **Page numbers** on the bottom-right of every slide (visible in both modes; survives PDF export).

### Keyboard shortcuts (Present mode)

| Key | Action |
|---|---|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `Home` | Jump to first slide |
| `End` | Jump to last slide |
| `Esc` | Exit to Review mode |

## Motion

In Present mode, build-deck plays three layers of motion. All CSS-only, gated by `prefers-reduced-motion`.

### Slide transitions

Topbar **Motion** selector lets the user pick between Auto (theme default), Fade, Slide, Zoom, or Cut. Per-theme defaults:

| Theme | Default | Theme | Default |
|---|---|---|---|
| Terracotta | Fade | Mono | Slide |
| Carbon | Slide | Aurora | Zoom |
| Berry | Fade | Brutalist | **Cut** (deliberate) |
| Lab | Slide | Dusk | Fade |

Selection persists to `localStorage.deck-transition`.

### Element entrance cascade

When a slide becomes current, child elements (title, subtitle, cards, pillars, flow nodes) stagger in over ~500ms total. Brutalist and Lab opt out — they're deliberately static.

### Background motion (per theme)

| Theme | Motion |
|---|---|
| Aurora | Gradient hue-drift, 20s loop |
| Mono | Dotted grid pulse on each slide change |
| Carbon | Scanline drift, 8s loop |
| Berry | Vignette breathe, 8s loop |
| Terracotta | Paper grain texture (static) |
| Dusk | None (deferred to v1.2 — needs JS particles) |
| Brutalist, Lab | None (deliberately static) |

All motion is suppressed when the OS reports `prefers-reduced-motion: reduce`.

## Export to PDF

The topbar has an **Export PDF** button that calls `window.print()`. The `@media print` CSS sets `@page` to 16:9 (13.333in × 7.5in), one slide per page, with `print-color-adjust: exact` so backgrounds and accents render. User picks "Save as PDF" in the print dialog. Works from both Review and Present mode (Present mode temporarily switches to Review for the print job, then restores).

## Workflow when the user asks for a deck

1. **Confirm scope** in one short sentence: subfolder name, slide count, source material. Don't over-clarify.
2. **Scaffold the folder.** If a Makefile exists at the project root, run `make new NAME=<deck-name>`. Otherwise: `mkdir <deck-name> && cp ~/.claude/skills/build-deck/template/* <deck-name>/`.
3. **Edit `content.md`.** Write all slides. Keep copy tight — slides are 16:9 with breathing room; trim if it doesn't fit.
4. **Customize the topbar title** in `index.html` (the `<title>` tag, the `topbar__title` text, and the `localStorage` key if you want per-deck theme persistence).
5. **Bake the content.** `make sync DECK=<deck-name>` from the project root, or `cd <deck-name> && node sync.js`.
6. **Tell the user it's in the preview panel** and how to switch themes.

## Editing an existing deck

- Edit `content.md` only — never edit the inline `<script type="text/yaml" id="content-data">` block by hand. That's a baked copy maintained by `sync.js`.
- After every content change run `node sync.js` (or `make sync DECK=...`).
- For visual tweaks (spacing, type), edit `index.html` directly — but prefer adjusting CSS variables in one theme block over redesigning markup.

## Hard rules

- `content.md` is the single source of truth. Never inline content as canonical.
- Don't add a fifth theme casually. If the user asks for a custom theme, add it as a new `[data-theme="..."]` block alongside the existing four.
- Every slide must fit 16:9 with breathing room. If a section feels cramped, trim copy or split the slide.
- Use the `Skill` tool to invoke this skill from inside a conversation; don't paraphrase the workflow when you can just follow it.
