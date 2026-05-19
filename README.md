# claude-skills

Personal Claude Code skills. Each subdirectory is a skill that can be loaded by
the `Skill` tool when working with Claude Code.

**Current release: [v1.0.0](https://github.com/LeoHChen/claude-skills/releases/tag/v1.0.0)** — see "What's new" below or the full [release notes](https://github.com/LeoHChen/claude-skills/releases/tag/v1.0.0).

## Skills

| Skill | What it does |
| --- | --- |
| [`build-deck`](build-deck/) | Themed website-rendered slide deck from a `content.md` YAML stream. **Dual-mode renderer** — Review (scroll) for editing, Present (one slide fills viewport) for delivery. Present mode adds a top progress hairline, floating bottom nav (`‹ Prev   NN / MM   Next ›`, fades on idle), and keyboard nav (`← / → / Space / Home / End / Esc`). On-slide page numbers visible in both modes and in PDF export. **8 themes**: Terracotta, Carbon, Berry, Lab, Mono, Aurora, Brutalist, Dusk — each with distinct typography and slide chrome (not just color). Slide types: `title`, `architecture`, `cards`, `flow`, `roadmap`, `questions`. Export-PDF works from both modes. |
| [`write-doc`](write-doc/) | Write a Markdown document and render it to a themed PDF via `make pdf DOC=<name> [THEME=<theme>]`. Themes: Terracotta, Carbon, Berry, Lab — tuned for print. Pandoc + headless Chromium pipeline (no LaTeX). |

## What's new in v1.0.0

**`build-deck` v2** — major upgrade from scroll-only to a presentation-grade renderer:

- Dual-mode (Review / Present) with persisted state.
- Top progress hairline, floating bottom nav, on-slide page numbers.
- Keyboard navigation in Present mode.
- 4 new themes — **Mono** (cyan + monospaced titles + dotted bar), **Aurora** (violet→teal gradient + glass cards + light-weight titles), **Brutalist** (Archivo Black ALL CAPS + 3px frame), **Dusk** (plum-dark + italic serif hero).
- Theme chip row replaced by a dropdown (scales to N themes).
- Each theme now varies in typography and slide chrome, not just palette.
- Bug fix: a duplicated `[data-theme="terracotta"]` CSS selector was silently applying Carbon's tokens to the Terracotta theme.

Design doc and implementation plan are in [`build-deck/docs/`](build-deck/docs/).

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
