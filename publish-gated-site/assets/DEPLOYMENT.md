# Deployment — release publishes, push does not

- **Every push** to `main` deploys **nothing**.
- **Every published GitHub release** publishes the site to
  https://__DOMAIN__/ behind a GitHub sign-in gate.

## What happens on a release

Publishing a release runs `.github/workflows/deploy-site.yml`, which installs the
toolchain, typechecks and tests the gate, runs `npm run build` (if present), and
moves the `release` branch to the released commit. **Cloudflare Workers Builds**
watches `release`: it clones the repo with Cloudflare's own GitHub App, runs the
build with `NODE_VERSION=22`, and deploys the `__WORKER_NAME__` Worker with
`npx wrangler deploy` under a Cloudflare-managed build token. No Cloudflare
credential is stored in GitHub.

```sh
git tag v1.0.0 && git push origin v1.0.0
gh release create v1.0.0 -R __GITHUB_REPOSITORY__ --title "v1.0.0" --notes "What changed"
```

The promotion push is fast-forward only. A release that is not ahead of
`release` fails instead of rewinding; roll back by cutting a forward release.
Never commit or push to `release` directly. Only the published-release workflow
may create or advance it.

Only `__ASSETS_DIR__/` is served. Whatever produces it is the build; the rest
of the repo never reaches the URL.

## The gate

`worker/index.ts` sits in front of every request. It issues a session only to
a GitHub account that can read `__GITHUB_REPOSITORY__`, so the site is visible
to people with repository access and to nobody else.

It needs a GitHub App of its own (account or org settings → Developer settings
→ GitHub Apps → New):

- **Homepage URL:** `https://__DOMAIN__`
- **Callback URL:** `https://__DOMAIN__/auth/callback`
- **Request user authorization (OAuth) during installation:** on
- **Webhook:** off
- **Repository permissions:** Contents read-only (plus GitHub's mandatory
  metadata read); nothing else
- **Install on:** only `__GITHUB_REPOSITORY__`

Only after the first release-backed Cloudflare build has succeeded, set three
Worker secrets from this repo. Never commit them or expose their values in
logs or shell history:

```sh
npx wrangler secret put GITHUB_APP_CLIENT_ID
npx wrangler secret put GITHUB_APP_CLIENT_SECRET
openssl rand -base64 48 | npx wrangler secret put SESSION_SECRET
npx wrangler secret list
```

The final command must list `GITHUB_APP_CLIENT_ID`,
`GITHUB_APP_CLIENT_SECRET`, and `SESSION_SECRET`. If it does not, the setup is
incomplete. Opening the App installation URL directly may show "Sign-in
expired" because there is no OAuth state cookie; start a real sign-in at
`https://__DOMAIN__/auth/login`.

**It fails closed.** Until the secrets exist, the deployed Worker serves a 503
"Configuration required" page and nothing else. That is the intended state
between the first deploy and the secrets being set, not a broken deploy.
Localhost is the one exception: `npm run preview:worker` serves the site
ungated so it can be checked without credentials.

`wrangler.jsonc` keeps the gate total: `assets.run_worker_first` routes every
request through the Worker, and `workers_dev: false` / `preview_urls: false`
make the Custom Domain the only origin. Do not weaken them, and keep
"builds for non-production branches" **off** in Workers Builds — a preview
deployment would hand the site an infrastructure hostname.

## One-time infrastructure bootstrap

Before the first release, `npm run bootstrap:worker` from a laptop with
`npx wrangler login` creates the Worker and custom-domain binding while missing
secrets keep every public request fail-closed with a 503. Once the gate is
configured, do not use it to publish content; every publication must come from
a tagged GitHub release.
