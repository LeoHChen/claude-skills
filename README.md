# claude-skills

Personal Claude Code skills. Each subdirectory is a skill that can be loaded by
the `Skill` tool when working with Claude Code.

## Skills

| Skill | What it does |
| --- | --- |
| [`build-deck`](build-deck/) | Build a themed website-rendered slide deck from a `content.md` YAML stream. Theme switcher (Terracotta / Carbon / Berry / Lab), Export-PDF button, slide types: `title`, `architecture`, `cards`, `flow`, `roadmap`, `questions`. |
| [`write-doc`](write-doc/) | Write a Markdown document and render it to a themed PDF via `make pdf DOC=<name> [THEME=<theme>]`. Same four themes as `build-deck`, tuned for print. Pandoc + headless Chromium pipeline (no LaTeX). |

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
