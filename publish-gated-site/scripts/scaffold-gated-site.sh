#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scaffold-gated-site.sh --domain <host> [options]

Scaffolds release-only, login-gated publishing for the site in the current
repo (or --dest): a GitHub Action that promotes a `release` branch when a
release is published, a Cloudflare Worker that gates every request behind
GitHub sign-in, wrangler.jsonc for a single custom domain, a redirect test,
and DEPLOYMENT.md. Cloudflare Workers Builds then deploys from `release`.

Required:
  --domain <host>        Custom domain the site is served on, e.g. deck.example.com

Options:
  --repo <owner/name>    GitHub repo the gate authorizes against. Default: `gh repo view`.
  --worker-name <name>   Cloudflare Worker name. Default: the repo name.
  --site-name <name>     Shown on the gate's pages. Default: the repo name.
  --assets-dir <dir>     Directory wrangler serves. Default: dist
  --build "<cmd>"        `npm run build` command to add if the repo has none.
  --allowlist "a,b,c"    Static repo with no build step: generate tools/build-site.mjs
                         that copies exactly these paths into --assets-dir. Implies
                         --build "node tools/build-site.mjs" unless --build is given.
  --gate <kind>          github (default). Other kinds are not scaffolded yet — see SKILL.md.
  --compat-date <date>   wrangler compatibility_date. Default: 2026-08-25 (known-good;
                         a date newer than the installed wrangler's workerd is rejected).
  --dest <dir>           Target repo directory. Default: current directory.
  --force                Overwrite files the scaffold owns if they already exist.
  -h, --help

Never prints or stores a secret. Prints the remaining setup and verification
steps at the end.

Example:
  scaffold-gated-site.sh --domain deck.example.com --allowlist "index.html,assets,robots.txt"
USAGE
}

domain=""; repo=""; worker_name=""; site_name=""; assets_dir="dist"; build_cmd=""
allowlist=""; gate="github"; compat_date="2026-08-25"; dest="$PWD"; force=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) domain="${2:-}"; shift 2 ;;
    --repo) repo="${2:-}"; shift 2 ;;
    --worker-name) worker_name="${2:-}"; shift 2 ;;
    --site-name) site_name="${2:-}"; shift 2 ;;
    --assets-dir) assets_dir="${2:-}"; shift 2 ;;
    --build) build_cmd="${2:-}"; shift 2 ;;
    --allowlist) allowlist="${2:-}"; shift 2 ;;
    --gate) gate="${2:-}"; shift 2 ;;
    --compat-date) compat_date="${2:-}"; shift 2 ;;
    --dest) dest="${2:-}"; shift 2 ;;
    --force) force=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -z "$domain" ]]; then
  echo "--domain is required (the custom domain the site is served on)." >&2
  usage >&2
  exit 2
fi
if [[ "$domain" =~ ^https?:// || "$domain" == */* ]]; then
  echo "--domain must be a bare hostname, e.g. deck.example.com (got: $domain)" >&2
  exit 2
fi
if [[ "$gate" != "github" ]]; then
  echo "Gate '$gate' is not scaffolded yet; only 'github' is. See SKILL.md § Other gates." >&2
  exit 2
fi
for bin in git node npm; do
  command -v "$bin" >/dev/null 2>&1 || { echo "Missing required command: $bin" >&2; exit 1; }
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
assets="$(cd "$script_dir/../assets" && pwd)"
dest="$(cd "$dest" && pwd)"

if [[ -z "$repo" ]]; then
  if command -v gh >/dev/null 2>&1; then
    repo="$(cd "$dest" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
  fi
  if [[ -z "$repo" ]]; then
    echo "--repo could not be inferred (no gh, or $dest is not a GitHub repo). Pass --repo owner/name." >&2
    exit 2
  fi
fi
repo_name="${repo##*/}"
[[ -n "$worker_name" ]] || worker_name="$(echo "$repo_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')"
[[ -n "$site_name" ]] || site_name="$repo_name"
if [[ -n "$allowlist" && -z "$build_cmd" ]]; then
  build_cmd="node tools/build-site.mjs"
fi
user_agent="$(echo "$site_name" | sed 's/[^A-Za-z0-9]/-/g')-Gate"
served_json="$(node -e 'console.log(JSON.stringify(process.argv[1] ? process.argv[1].split(",").map(s => s.trim()).filter(Boolean) : []))' "$allowlist")"

export SCAFFOLD_VARS
SCAFFOLD_VARS="$(node -e 'console.log(JSON.stringify({
  DOMAIN: process.argv[1], SITE_ORIGIN: "https://" + process.argv[1], GITHUB_REPOSITORY: process.argv[2],
  WORKER_NAME: process.argv[3], SITE_NAME: process.argv[4], USER_AGENT: process.argv[5],
  ASSETS_DIR: process.argv[6], COMPAT_DATE: process.argv[7], SERVED: process.argv[8],
}))' "$domain" "$repo" "$worker_name" "$site_name" "$user_agent" "$assets_dir" "$compat_date" "$served_json")"

# Render a template: replace every __PLACEHOLDER__ via node so no shell or sed
# escaping applies to the file contents.
render() {
  local src="$1" out="$2"
  if [[ -e "$out" && $force -ne 1 ]]; then
    echo "  skip   $out (exists; use --force to overwrite)"
    return
  fi
  mkdir -p "$(dirname "$out")"
  node - "$src" "$out" <<'NODE'
const fs = require('node:fs');
const [src, out] = process.argv.slice(2);
const vars = JSON.parse(process.env.SCAFFOLD_VARS);
let text = fs.readFileSync(src, 'utf8');
for (const [key, value] of Object.entries(vars)) text = text.split(`__${key}__`).join(value);
// Cookie-prefix names (__Host-, __Secure-) are not placeholders: placeholders are ALL CAPS.
const leftover = text.match(/__[A-Z][A-Z_]+__/g);
if (leftover) { console.error(`unrendered placeholder in ${out}: ${leftover.join(', ')}`); process.exit(1); }
fs.writeFileSync(out, text);
NODE
  echo "  write  $out"
}

echo "Scaffolding release-gated publishing in $dest"
echo "  domain=$domain repo=$repo worker=$worker_name assets=$assets_dir gate=$gate"
render "$assets/.github/workflows/deploy-site.yml" "$dest/.github/workflows/deploy-site.yml"
render "$assets/worker/index.ts"                    "$dest/worker/index.ts"
render "$assets/worker/tsconfig.json"               "$dest/worker/tsconfig.json"
render "$assets/tests/worker-return-to.test.mjs"    "$dest/tests/worker-return-to.test.mjs"
render "$assets/wrangler.jsonc"                     "$dest/wrangler.jsonc"
render "$assets/.dev.vars.example"                  "$dest/.dev.vars.example"
render "$assets/DEPLOYMENT.md"                      "$dest/DEPLOYMENT.md"
if [[ -n "$allowlist" ]]; then
  render "$assets/tools/build-site.mjs"             "$dest/tools/build-site.mjs"
fi

# package.json: create or merge. Never sets "type": "module" — CommonJS helper
# scripts in the target repo would break silently. The .mjs/.ts files here do
# not need it.
node - "$dest/package.json" "$build_cmd" "$repo_name" <<'NODE'
const fs = require('node:fs');
const [file, buildCmd, name] = process.argv.slice(2);
const pkg = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { name, version: '0.1.0', private: true };
pkg.engines = pkg.engines ?? {};
pkg.engines.node = pkg.engines.node ?? '>=22.12.0';
pkg.scripts = pkg.scripts ?? {};
const scripts = {
  'typecheck': 'tsc --noEmit -p worker/tsconfig.json',
  'test:worker': 'node --experimental-strip-types --test tests/worker-return-to.test.mjs',
  // wrangler dev rewrites the request host to the custom domain, which defeats
  // the gate's localhost bypass; pin the host so the preview stays ungated.
  'preview:worker': 'npm run build --if-present && wrangler dev --host localhost',
  // One-time infrastructure bootstrap while the missing gate secrets keep the
  // public site fail-closed. Releases are the only publishing path afterwards.
  'bootstrap:worker': 'npm run build --if-present && wrangler deploy',
};
if (buildCmd && !pkg.scripts.build) scripts.build = buildCmd;
const added = [];
for (const [key, value] of Object.entries(scripts)) {
  if (!pkg.scripts[key]) { pkg.scripts[key] = value; added.push(key); }
}
pkg.devDependencies = pkg.devDependencies ?? {};
const dev = { '@cloudflare/workers-types': '^5.20260829.1', 'typescript': '^7.0.2', 'wrangler': '^4.126.0' };
for (const [key, value] of Object.entries(dev)) if (!pkg.devDependencies[key]) { pkg.devDependencies[key] = value; added.push(key); }
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log(`  update package.json (${added.length ? 'added ' + added.join(', ') : 'nothing to add'})`);
if (pkg.type === 'module') console.log('  note   package.json has "type": "module" — fine only if every .js script in this repo is ESM.');
NODE

# .gitignore: only add what the scaffold introduces.
ignore_file="$dest/.gitignore"; touch "$ignore_file"
add_ignore() { grep -qxF "$1" "$ignore_file" || { echo "$1" >> "$ignore_file"; echo "  ignore $1"; }; }
add_ignore "node_modules/"
add_ignore ".wrangler/"
add_ignore ".dev.vars"
add_ignore ".dev.vars.*"
add_ignore "!.dev.vars.example"
if [[ -n "$build_cmd" ]]; then add_ignore "${assets_dir%/}/"; fi

cat <<NEXT

Done. Verify, then complete setup in this order:

  1. npm install && npm run typecheck && npm run test:worker && npm run build --if-present
     npm run preview:worker   # ungated on http://localhost:8787 — check the site and a 404 path
  2. Commit. Push main (if this repo asks you to confirm before pushing, ask).
  3. One-time fail-closed infrastructure bootstrap from a laptop with
     \`npx wrangler login\` done:
       npm run bootstrap:worker
     This creates the Worker '$worker_name' and binds $domain. With no gate
     secrets set, every public path serves "Configuration required" (503).
  4. Publish a tagged GitHub release. Its workflow alone creates or advances
     the 'release' branch to the exact tagged commit. Never push that branch manually.
  5. Connect Cloudflare Workers Builds:
     Cloudflare dashboard → Workers & Pages → $worker_name → Settings → Builds → Connect:
       repo $repo · production branch: release · builds for non-production branches: OFF
       root: / · build: npm run build (or blank) · deploy: npx wrangler deploy
       build variable NODE_VERSION=22 · API token: Create new token
     Cloudflare's GitHub App must be able to see $repo (installation → repository access).
     Wait for the release-backed build to succeed while the site still returns 503.
  6. Register the dedicated GitHub App and set all three Worker secrets securely —
     see DEPLOYMENT.md § The gate. Verify with \`npx wrangler secret list\`.
     The site flips from 503 to sign-in only after released content is deployed.
  7. Verify sign-out, authorized sign-in, every intended route, disabled workers.dev,
     and that a push to main produces no Cloudflare deployment.
NEXT
