#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bootstrap-agentic-project.sh <repo-name> [parent-dir]

Creates a private GitHub repo under OWNER (default: LeoHChen), clones it,
installs Leo's agentic project scaffold, commits and pushes the scaffold, and
opens the initial planning issue.

Environment:
  OWNER=LeoHChen        GitHub owner or organization.

Example:
  bootstrap-agentic-project.sh my-new-app ~/projects
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

repo_name="${1:-}"
parent_dir="${2:-$PWD}"
owner="${OWNER:-LeoHChen}"

if [[ -z "$repo_name" ]]; then
  usage >&2
  exit 2
fi

for bin in gh git; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing required command: $bin" >&2
    exit 1
  fi
done

gh auth status >/dev/null

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_dir="$(cd "$script_dir/.." && pwd)"
assets_dir="$skill_dir/assets"
target_dir="$parent_dir/$repo_name"

if [[ ! -d "$assets_dir" ]]; then
  echo "Missing assets directory: $assets_dir" >&2
  exit 1
fi

if [[ -e "$target_dir" ]]; then
  echo "Target already exists: $target_dir" >&2
  exit 1
fi

mkdir -p "$parent_dir"

if [[ -d "$HOME/projects/claude-skills/.git" ]]; then
  git -C "$HOME/projects/claude-skills" pull --ff-only
fi

gh repo create "$owner/$repo_name" --private
git clone "https://github.com/$owner/$repo_name.git" "$target_dir"
git -C "$target_dir" checkout -B main

cp -R "$assets_dir/." "$target_dir/"

git -C "$target_dir" add CLAUDE.md AGENTS.md .claude .github
git -C "$target_dir" commit -m "chore: bootstrap agentic project scaffold"
git -C "$target_dir" push -u origin main

gh label create planning \
  --repo "$owner/$repo_name" \
  --color "2563A8" \
  --description "Planning gate before implementation" >/dev/null 2>&1 || true

issue_body_file="$(mktemp)"
trap 'rm -f "$issue_body_file"' EXIT

cat >"$issue_body_file" <<ISSUE_BODY
## Goal
Define the first implementation plan for $repo_name.

## Motivation
This project has been bootstrapped with Leo's agentic development process. Product implementation should not start until this issue captures the accepted plan.

## Scope
- Confirm product goal and first milestone.
- Define initial architecture and repository structure.
- Identify the first implementation branch and verification path.

## Non-goals
- No product implementation before this plan is accepted.

## Three-Agent Review
TPM:
- Confirm labels, milestone, and acceptance criteria.

Coder:
- Propose the smallest implementation path and verification commands.

Designer/Reviewer:
- Identify UX/design/review risks and expected PR review focus.

## Implementation Plan
TBD with Leo before coding starts.

## Verification Plan
TBD with Leo before coding starts.

## Acceptance Criteria
- Goal and scope are accepted.
- Implementation plan is specific enough for the Coder agent.
- Verification plan is runnable or explicitly documents gaps.
ISSUE_BODY

issue_url="$(gh issue create \
  --repo "$owner/$repo_name" \
  --title "Project plan: initial implementation" \
  --label planning \
  --body-file "$issue_body_file")"

echo "Created repo: https://github.com/$owner/$repo_name"
echo "Cloned to: $target_dir"
echo "Opened planning issue: $issue_url"
