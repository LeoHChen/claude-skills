---
name: build-deck
description: Build a slide deck using the user's standard pattern — content lives in content.md (YAML stream), rendering is a themed website with a topbar theme switcher (Terracotta, Carbon, Berry, Lab). Use when the user asks to build, design, draft, or revise a slide deck or presentation in any project. Each deck lives in its own subfolder with content.md, index.html, and sync.js. Avoid PowerPoint/PPTX unless the user explicitly asks.
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

Built into `index.html` as CSS-variable swaps. User picks via topbar. Markup never changes.

## Export to PDF

The topbar has an **Export PDF** button that calls `window.print()`. The `@media print` CSS sets `@page` to 16:9 (13.333in × 7.5in), one slide per page, with `print-color-adjust: exact` so backgrounds and accents render. User picks "Save as PDF" in the print dialog.

- **Terracotta** — warm cream + terracotta + forest green; serif display. Default.
- **Carbon** — premium dark with electric lime + warm orange.
- **Berry** — cream + berry + dusty rose; serif display.
- **Lab** — minimal off-white with magenta + mint-teal.

**Never default to deep blue** — the user has explicitly rejected that aesthetic. Pick a default that matches the deck's mood (Terracotta for warm/strategic, Carbon for technical/fundraising, Berry for editorial, Lab for product/clinical).

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
