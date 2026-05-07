---
name: write-doc
description: Write or update a markdown document that ships as a themed PDF. Source is always .md; rendering is pandoc + headless Chromium driven by `make pdf DOC=<name>`. Use when the user asks to write, draft, revise, or update any prose document — design doc, RFC, memo, white paper, technical spec, brief, exec summary — that's likely to be circulated as a PDF. Themes available: terracotta, carbon, berry, lab. Don't use Word, Pages, Google Docs, or LaTeX directly.
---

# Writing PDF-renderable docs (User's Standard Pattern)

When the user asks to write or update a prose document that may be shared
as a PDF, follow this pattern.

## File layout

```
{project}/
├── Makefile              # provides `make pdf DOC=<name> [THEME=<name>]`
├── themes/
│   ├── terracotta.css    # warm cream + terracotta + forest (default)
│   ├── carbon.css        # white page, sharp sans, lime accent
│   ├── berry.css         # cream + deep berry serif
│   └── lab.css           # off-white + magenta + mint
└── {doc-name}.md         # source — always plain Markdown
```

## Workflow

1. **Write the doc** as `{doc-name}.md`. Plain Markdown. Use `---` for
   horizontal rules between major sections; the renderer styles them
   tastefully.
2. **Render to PDF** with the Makefile target:
   ```bash
   make pdf DOC=my-doc                  # uses default theme (terracotta)
   make pdf DOC=my-doc THEME=carbon     # explicit theme
   make themes                          # list available themes
   ```
3. The output is `{doc-name}.pdf` next to the source. Open it, share it,
   or commit it depending on the project's convention.

## Themes (same names as the build-deck skill; tuned for print)

| Theme | Vibe | Headers | Accent |
| --- | --- | --- | --- |
| **terracotta** *(default)* | Warm, editorial, thoughtful | Fraunces (serif) | `#B85042` |
| **carbon** | Technical, sharp, premium | Space Grotesk (geometric sans) | `#16A34A` (vivid green) |
| **berry** | Elegant, formal | Fraunces (serif) | `#6D2E46` |
| **lab** | Modern, minimal, design-y | Space Grotesk | `#FF2D6B` |

All themes use a light page (white or cream) for print readability.
Carbon uses a dark code block as the only dark element — keeps the
"carbon" feel without exhausting the printer.

**Never default to a deep-blue theme** — the user has explicitly
rejected that aesthetic across the deck and doc skills.

## Scaffolding a new project

If no Makefile / themes/ exists in the target folder:

```bash
cp -R ~/.claude/skills/write-doc/template/* {project}/
```

## Adding the doc target to an existing Makefile

If the project already has a Makefile, copy just the `pdf:`, `themes:`,
and the variable block from `template/Makefile`. Also copy `themes/`.

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
