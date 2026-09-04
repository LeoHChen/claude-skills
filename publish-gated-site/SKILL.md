---
name: publish-gated-site
description: Use when the user wants to publish, host or deploy a website that lives in a private GitHub repo to a custom domain, gated behind a login (GitHub sign-in today; other gates later), with deploys triggered only by a published GitHub release — never on push or manual dispatch. Scaffolds and verifies the GitHub Action, Cloudflare Worker gate, wrangler config, redirect tests, documentation, Workers Builds, GitHub App and secrets. Asks for the domain name.
---

# Publish a Gated Site (release-only)

Use this when a site in a private repo needs a real URL that only the team can
open, and the team wants **publishing to be a deliberate act** — a GitHub
release — rather than a side effect of every push.

## Core rules

- **Only a published release publishes.** The workflow triggers on
  `release: [published]`. Do not add `push` or `workflow_dispatch`,
  even if asked to "make it deploy automatically" — a release *is* the
  automation, and it is what keeps investors, customers or co-founders from
  seeing a half-edited page.
- **No hosting credential in GitHub.** Cloudflare Workers Builds clones the
  repo with Cloudflare's own GitHub App and deploys under a Cloudflare-managed
  build token. The Action only moves a branch pointer.
- **Handle credentials safely.** When authenticated browser and CLI access are
  available, configure the dedicated GitHub App and Worker secrets yourself,
  with user confirmation immediately before creating persistent OAuth
  credentials or expanding repository access. Never print, log, commit, or put
  secret values in shell history. If that access is unavailable, give the
  human the exact handoff and report the setup as incomplete—not successful.
- **Fail closed.** Until the secrets exist the deployed Worker serves a 503
  page, not the site. That is the intended interim state, not a bug.
- **Single origin, total gate.** `workers_dev: false`, `preview_urls: false`
  and `assets.run_worker_first: true` are the security posture. Never weaken
  them; keep "builds for non-production branches" off in Workers Builds.

## Inputs — ask only for what you cannot infer

| Input | How to get it |
|---|---|
| **Domain** (required) | Ask. A bare hostname, e.g. `deck.example.com`. The zone must already be on Cloudflare. |
| Repo | `gh repo view --json nameWithOwner` in the target repo. |
| What is served | Look: a build that produces a directory (Astro/Next/Vite → `dist/`), or a static repo where only some files should be public → `--allowlist`. Ask if unclear. |
| Gate | Default `github`. See *Other gates* before promising anything else. |
| Worker name | Default: repo name. |

If the user gave the domain in their request, do not ask again.

## Required sequence

0. **Issue first** if the target repo works that way (Leo's repos do): capture
   the domain, what is served, what is *not* served, the gate, and the fact
   that push will no longer publish. Read the repo's `CLAUDE.md` — branching
   rules (trunk vs PR), "confirm before pushing", and force-push bans change
   what you may do in steps 4–6.
1. **Scaffold** from the target repo's root:
   ```bash
   ~/.claude/skills/publish-gated-site/scripts/scaffold-gated-site.sh --domain <host> [--allowlist "index.html,assets,robots.txt"] [--build "<cmd>"]
   ```
   It writes `.github/workflows/deploy-site.yml`, `worker/index.ts`,
   `worker/tsconfig.json`, `tests/worker-return-to.test.mjs`, `wrangler.jsonc`,
   `.dev.vars.example`, `DEPLOYMENT.md`, optionally `tools/build-site.mjs`,
   merges scripts and devDependencies into `package.json`, and extends
   `.gitignore`. It refuses to overwrite existing files without `--force`.
2. **Verify locally** — all four, every time:
   ```bash
   npm install && npm run typecheck && npm run test:worker && npm run build --if-present
   npm run preview:worker    # then curl / and a path that must 404
   ```
   For an allowlist site, prove the exclusions: sources, exports, docs and
   `package.json` must be 404 on localhost.
3. **Update the repo's docs.** If a `CLAUDE.md`/`AGENTS.md`/`README.md` says
   "not hosted", "push to deploy", or names another host, fix it now — a stale
   guide will make the next session undo this. Say plainly: push rebuilds
   (if the repo has a build CI), release publishes.
4. **Commit and push** per the repo's rules. Trunk-direct repos: commit to
   `main`, confirming first if the guide asks. PR repos: branch, PR, wait.
5. **Bootstrap the Worker while it is fail-closed** from a laptop that has
   done `npx wrangler login`: `npm run bootstrap:worker`. This one-time step
   creates the Worker and binds the custom domain, but the missing gate secrets
   keep every public path on the 503 configuration page. Verify `/`, an asset
   path, and a path that should not exist all fail closed; confirm
   `<worker>.<account>.workers.dev` does **not** serve. Never use this command
   as an alternate publishing path after the gate is configured.
   *Your machine's resolver may have cached NXDOMAIN for the new hostname from
   an earlier lookup — use `curl --resolve host:443:<cf-ip>` to bypass it.*
6. **Publish the first tagged GitHub release.** Follow the repo's existing tag
   convention (check `gh release list`; do not invent `v0.1.0` next to an
   existing `v0.7`). The release workflow—not a manual branch push—creates or
   fast-forwards `release` to the exact tagged commit. Never commit or push to
   `release` directly.
7. **Connect Cloudflare Workers Builds** in the Cloudflare dashboard: Worker →
   Settings → Builds → Connect —
   repo, production branch `release`, **non-production builds off**, root `/`
   (or the site's subdirectory), build command, `npx wrangler deploy`,
   `NODE_VERSION=22`, API token **Create new token** (one per Worker, so
   retiring one project cannot break another). If you have browser tools,
   drive this yourself; the Connect dialog sometimes mounts invisibly —
   interact through element refs, not screenshots. Cloudflare's GitHub App
   must have access to the repo; expanding its scope is a permission change
   the user confirms.
   Wait for the build from `release` to succeed while the gate still returns
   503. This ordering ensures the first content that can become visible is the
   released content.
8. **Configure the gate.** Exact settings are in the generated
   `DEPLOYMENT.md`: register a dedicated GitHub App (homepage +
   `/auth/callback` on the domain, *Request user authorization during
   installation* on, Contents read-only, installed on that one repo), then set
   the three Worker secrets without exposing their values. Use authenticated
   browser/CLI access yourself when available; otherwise hand off these exact
   steps and stop with setup incomplete. Run `npx wrangler secret list` and
   require all three names before proceeding. The third secret flips the
   already release-backed deployment from 503 to sign-in; no redeploy.
9. **Verify end to end:** `/` → sign-in redirect, an asset → 401 without a
   session, authorized GitHub login → every intended route loads, workers.dev
   → unavailable, and a push to `main` → no Cloudflare build. Opening the App
   installation URL can initially show "Sign-in expired" because it has no
   OAuth state cookie; begin the real sign-in at `/auth/login`.

## Other gates

Only `github` is scaffolded. When another gate is wanted, say what changes and
what stays before building:

- **`cloudflare-access`** — put Cloudflare Access (Zero Trust) in front of the
  custom domain; the Worker then only serves assets (`env.ASSETS.fetch` with
  the security headers). The release workflow, `wrangler.jsonc` posture and
  Workers Builds wiring are unchanged. Access policies are configured in the
  dashboard, not in code.
- **`none`** — public site. Drop `worker/index.ts`'s gate branch, keep the
  headers, keep `run_worker_first` only if the Worker still does something.
  Remove `noindex` deliberately, not as a cleanup.

Add a gate to the scaffold only after it has been built by hand once.

## Gotchas this skill exists to remember

- `actions/checkout` is shallow; a fast-forward push of `release` fails with
  "fetch first". The template sets `fetch-depth: 0` and checks ancestry.
- `wrangler dev` rewrites the request host to the route's custom domain, so a
  hostname-based localhost bypass never triggers. `preview:worker` pins
  `--host localhost`.
- Adding `"type": "module"` to a repo whose helper scripts are CommonJS breaks
  them silently. The scaffold never sets it.
- Cloudflare's connect dialog can mount without painting. The state is in the
  DOM; use element refs.
- A `compatibility_date` newer than the installed wrangler's workerd is
  rejected. The scaffold defaults to a known-good date; bump with
  `--compat-date` when wrangler is upgraded.
- Copies of the gate exist across repos. A bug fixed in one is fixed in all —
  and in this skill's `assets/worker/index.ts`.

The rationale and setup-order failure modes are recorded in
[`docs/2026-09-04-design.md`](docs/2026-09-04-design.md).

## When not to use

- The site is meant to be public with no gate and no release ceremony — a
  plain Workers Builds "deploy on push" is simpler.
- Hosting is not Cloudflare Workers. The gate and the branch-pointer pattern
  port, but nothing here is tested elsewhere.
- The repo already has a working release-deploy path; extend it rather than
  scaffolding a second one.
