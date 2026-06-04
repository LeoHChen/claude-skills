# CLAUDE.md

This file provides Claude Code guidance for this project. Keep the parallel
`AGENTS.md` aligned with this file. Both are authoritative; translate
tool-specific language into the equivalent behavior for the active agent.

## Startup Checklist

- Identify the target project and working directory.
- Read local `CLAUDE.md` and `AGENTS.md` files before editing.
- Check `git status --short --branch`.
- Inspect the project manifest before running commands: `package.json`,
  `pyproject.toml`, `Cargo.toml`, `Makefile`, `README.md`, or local scripts.
- Prefer Leo's reusable skills from `LeoHChen/claude-skills` when one applies.

## Canonical Project Process

For new projects, the remote private GitHub repo is created first under
`LeoHChen` unless Leo specifies another owner. Product implementation starts only
after a GitHub planning issue exists and Leo has accepted the plan.

For non-trivial work:

1. Open or identify the GitHub issue first.
2. Capture goal, motivation, scope, non-goals, assumptions, acceptance criteria,
   implementation plan, and verification plan in the issue.
3. Branch fresh from the latest `origin/main`.
4. Implement narrowly against the issue.
5. Verify with the narrowest relevant checks.
6. Open a PR linked to the issue with `Closes #N` or `Fixes #N`.
7. Confirm the issue closes after merge.

Skip the issue gate only for trivial edits, such as typo fixes, comments, or
one-line config changes.

## Three-Agent Operating Model

- **TPM agent**: manages GitHub issues, planning, labels, milestones, PR status,
  and merge readiness. It does not edit source code.
- **Coder agent**: implements from an accepted issue, runs local checks, commits,
  and opens a draft PR. It does not merge PRs or cut releases.
- **Designer/Reviewer agent**: owns UI/design consistency when relevant and
  reviews every coder PR for correctness, regressions, maintainability, and test
  gaps. It comments on PRs rather than pushing onto coder branches.

A release agent can be added for projects with formal release/deployment needs.

## Engineering Standards

- Read surrounding code before editing.
- Keep changes scoped to the issue and existing project patterns.
- Prefer simple, direct implementation over speculative abstraction.
- Preserve user changes; never reset or overwrite unrelated work.
- Do not force-push, delete tags, or use destructive Git commands unless Leo
  explicitly asks.
- Report verification gaps honestly.

## Documents And Presentations

- Use Leo's `write-doc` skill for PDF-ready Markdown documents.
- Use Leo's `build-deck` skill for slide decks.
- Verify current facts from primary sources when market, legal, financial,
  medical, or current-company accuracy matters.
