---
name: start-agentic-project
description: Use when starting a new software project, GitHub repository, prototype, app, coding workspace, or agentic development project for Leo.
---

# Start Agentic Project

## Core Rule

For a new Leo project, do not start implementation in an ad hoc local folder.
Start with a private GitHub repo, install the project agent scaffold, then open
a planning issue before product code is written.

## Required Sequence

1. Confirm the target repo name and owner. Default owner: `LeoHChen`.
2. Create the remote private GitHub repo first:
   ```bash
   gh repo create LeoHChen/<repo> --private
   ```
3. Clone the repo locally. Default parent: `~/projects`.
4. Copy this skill's `assets/` into the repo:
   - `CLAUDE.md`
   - `AGENTS.md`
   - `.claude/agents/tpm.md`
   - `.claude/agents/coder.md`
   - `.claude/agents/designer.md`
   - `.github/ISSUE_TEMPLATE/planning.yml`
   - `.github/PULL_REQUEST_TEMPLATE.md`
5. Commit and push only the process scaffold.
6. Open a GitHub planning issue with goal, scope, non-goals, agent review, plan,
   and verification criteria.
7. Do not implement until the planning issue exists and the user accepts the plan.

Shortcut when appropriate:

```bash
start-agentic-project/scripts/bootstrap-agentic-project.sh <repo-name> [parent-dir]
```

The script creates a private repo, clones it, installs the templates, commits
the scaffold, pushes `main`, and opens the initial planning issue.

## Leo's Operating Model

Use Leo's own skill repo as the process source of truth. If
`~/projects/claude-skills` exists, pull it before scaffolding. If a relevant
skill exists there, use it instead of inventing a one-off process.

Every substantial project uses the three-agent loop:

- **TPM**: GitHub issues, planning, labels, milestones, PR status, merge readiness.
  Does not edit source code.
- **Coder**: implementation from an accepted issue, narrow changes, local
  verification, commit, draft PR. Does not merge or release.
- **Designer/Reviewer**: design-system review for UI work and post-implementation
  review for every coder PR. Comments on PRs; does not push onto coder branches.

Release/deployment can be a fourth agent when the project needs a formal release
lane, but it is not part of the core three-agent implementation loop.

## Issue Gate

Before implementation, the planning issue must include:

- goal and user value
- scope and non-goals
- assumptions and open questions
- TPM, Coder, and Designer/Reviewer notes
- implementation plan
- verification plan
- acceptance criteria

If the user asks to skip the issue gate, ask for explicit confirmation and record
the exception in the first commit or PR body.

## PR Rules

- Branch from current `origin/main`; do not stack on in-flight branches.
- Reference the issue in branch names, commits, and PR body.
- Include `Closes #N` or `Fixes #N` in the PR body.
- Rebase on the latest remote base branch before opening the PR.
- Run the narrowest relevant verification after the rebase.
- After merge, confirm the linked issue closed; close it manually with a note if
  GitHub did not auto-close it.

## When Not To Use

Do not use this skill for small edits inside an existing project that already has
local instructions, an issue, and a branch. Follow that project's local process.
