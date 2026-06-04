---
name: write-doc
description: Write or update a markdown document that ships from a Markdown source into themed HTML and PDF outputs. Source is always .md; rendering is make-driven via `make sync DOC=<name>` for `index.html` and `make pdf DOC=<name>` for the printable PDF. Use when the user asks to write, draft, revise, or update any prose document — design doc, RFC, memo, white paper, technical spec, brief, exec summary, resume, CV — that's likely to be circulated as a PDF. Themes available: terracotta, carbon, berry, lab, cv, cv-modern, cv-editorial, cv-mono. Don't use Word, Pages, Google Docs, or LaTeX directly.
---

# Writing PDF-renderable docs (User's Standard Pattern)

When the user asks to write or update a prose document that may be shared
as a PDF, follow this pattern.

## File layout

```
{project}/
├── Makefile              # provides `make sync DOC=<name>` and `make pdf DOC=<name>`
├── index.html            # generated preview, baked from {doc-name}.md
├── themes/
│   ├── terracotta.css    # warm cream + terracotta + forest (default)
│   ├── carbon.css        # white page, sharp sans, lime accent
│   ├── berry.css         # cream + deep berry serif
│   ├── lab.css           # off-white + magenta + mint
│   ├── cv.css            # tight two-page resume/CV print layout
│   ├── cv-modern.css     # polished executive resume/CV print layout
│   ├── cv-editorial.css  # classic literary serif CV (ivory + oxblood)
│   └── cv-mono.css       # engineer-forward monospace CV (emerald)
└── {doc-name}.md         # source — always plain Markdown
```

## Workflow

1. **Write the doc** as `{doc-name}.md`. Plain Markdown. Use `---` for
   horizontal rules between major sections; the renderer styles them
   tastefully.
2. **Sync the HTML preview** with the Makefile target:
   ```bash
   make sync DOC=my-doc                 # bakes my-doc.md into index.html
   make sync DOC=my-doc THEME=carbon    # preview under a different theme
   make sync DOC=my-resume THEME=cv          # tight resume/CV preview
   make sync DOC=my-resume THEME=cv-modern   # modern executive CV preview
   ```
3. **Render to PDF** with the Makefile target:
   ```bash
   make pdf DOC=my-doc                  # uses default theme (terracotta)
   make pdf DOC=my-doc THEME=carbon     # explicit theme
   make pdf DOC=my-resume THEME=cv          # tight resume/CV PDF
   make pdf DOC=my-resume THEME=cv-modern   # modern executive CV PDF
   make themes                          # list available themes
   ```
4. The outputs are `index.html` for browser review and `{doc-name}.pdf`
   for sharing. Open them, share them, or commit them depending on the
   project's convention.

## Themes (same names as the build-deck skill; tuned for print)

| Theme | Vibe | Headers | Accent |
| --- | --- | --- | --- |
| **terracotta** *(default)* | Warm, editorial, thoughtful | Fraunces (serif) | `#B85042` |
| **carbon** | Technical, sharp, premium | Space Grotesk (geometric sans) | `#16A34A` (vivid green) |
| **berry** | Elegant, formal | Fraunces (serif) | `#6D2E46` |
| **lab** | Modern, minimal, design-y | Space Grotesk | `#FF2D6B` |
| **cv** | Dense, resume/CV-ready | Inter | `#1F4D78` |
| **cv-modern** | Polished executive CV | Space Grotesk + Inter | `#2563A8` + `#C17A18` |
| **cv-editorial** | Classic, literary executive CV | Source Serif 4 (serif) | `#7A2E2A` (oxblood) |
| **cv-mono** | Engineer-forward, terminal-inspired CV | JetBrains Mono + Inter | `#0E8A5F` (emerald) |

All themes use a light page (white or cream) for print readability.
Carbon uses a dark code block as the only dark element — keeps the
"carbon" feel without exhausting the printer.
CV uses tighter margins, spacing, and type scale so resume-style Markdown
can usually fit into one or two pages without switching tools.
CV Modern keeps the same resume density but adds a stronger header,
subtle contact band, blue section hierarchy, and amber highlight accent
for a more contemporary executive document.
CV Editorial is a classic, print-editorial take — serif throughout on
warm ivory, oxblood small-caps section labels, and a fleuron footer
ornament for gravitas.
CV Mono is engineer-forward — monospace name and metadata, zero-padded
section numbers, a terminal cursor mark, and an emerald accent.
All three CV themes support an optional designed footer: wrap closing
content in a `::: {.footer}` fenced div (trait chips + a one-line
statement) and the theme styles it to match.

**Never default to a deep-blue theme** — the user has explicitly
rejected that aesthetic across the deck and doc skills.

## Scaffolding a new project

If no Makefile / themes/ exists in the target folder:

```bash
cp -R ~/.claude/skills/write-doc/template/* {project}/
```

## Adding the doc target to an existing Makefile

If the project already has a Makefile, copy the variable block plus the
`sync:`, `pdf:`, and `themes:` targets from `template/Makefile`. Also
copy `themes/`.

## Adding a new theme

Drop a new CSS file into `themes/<name>.css`. The Makefile auto-discovers
it. Use one of the existing themes as a starting point — they share the
same layout rules (page size, heading hierarchy, table styling); the
difference is fonts, colors, and a couple of accent choices.

## Hard rules

- **Source is always Markdown.** Don't write into Pages/Word/Google Docs
  formats. If the user gives you a non-MD source, convert to MD first.
- **PDF is generated, not edited.** Never edit the PDF directly. The
  `.md` is canonical.
- **`index.html` is generated, not edited.** Regenerate it from `.md`
  via `make sync DOC=<name>` whenever content changes.
- **Themes are CSS-only differences** — same Markdown renders under any
  theme. Don't put per-theme content in the .md.
- **Page size is US Letter** by default. International users can
  override via `@page` in the chosen theme CSS.
- **Pandoc + headless Chromium**, no LaTeX. Doesn't need anyone to
  install a heavy toolchain.

## Tools required on the machine

- `pandoc` (`brew install pandoc`)
- One of: Brave, Google Chrome, Chromium (auto-detected by the Makefile)

## When to invoke this skill

- "Write a memo / brief / one-pager / RFC about X"
- "Draft a design doc for Y"
- "Turn these notes into a white paper"
- "Update the spec / synthesis doc / strategy memo"
- Any time the user says "I need a PDF" of a doc they want to share
- Any time the user wants you to "write a document" (vs. a slide deck —
  that's the build-deck skill)

If the request is for slides, use `build-deck` instead. If the request
is for a script, code, or an internal note, this skill probably doesn't
apply.
