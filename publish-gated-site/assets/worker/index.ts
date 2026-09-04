/**
 * GitHub sign-in gate in front of a static site served from `env.ASSETS`.
 *
 * Every request — pages, CSS, images, the lot — has to carry a valid session
 * cookie, and a session is only issued to a GitHub account that can actually
 * read `GITHUB_REPOSITORY`. Authorization, not just authentication.
 *
 * `assets.run_worker_first` in wrangler.jsonc is what routes static files
 * through here rather than straight off the edge; without it the gate would
 * only cover paths the asset server does not recognise.
 *
 * Fail-closed: with no credentials configured, a deployed Worker serves a 503
 * rather than the site. Localhost is the one exception, so `wrangler dev
 * --host localhost` still works for ordinary layout work. (Plain `wrangler dev`
 * rewrites the request host to the route's custom domain, which defeats the
 * bypass — hence the flag.)
 *
 * The ALL-CAPS double-underscore placeholders in the constants below are
 * filled in by scripts/scaffold-gated-site.sh. If this file is copied by hand,
 * replace them.
 */

type Env = {
  ASSETS: Fetcher;
  GITHUB_APP_CLIENT_ID?: string;
  GITHUB_APP_CLIENT_SECRET?: string;
  GITHUB_REPOSITORY?: string;
  SESSION_SECRET?: string;
  SITE_ORIGIN?: string;
};

type Session = {
  exp: number;
  githubId: number;
  login: string;
  repository: string;
};

type OAuthState = {
  codeVerifier: string;
  returnTo: string;
  state: string;
};

const DEFAULT_ORIGIN = '__SITE_ORIGIN__';
const DEFAULT_REPOSITORY = '__GITHUB_REPOSITORY__';
const SITE_NAME = '__SITE_NAME__';
const USER_AGENT = '__USER_AGENT__';
const SESSION_COOKIE = '__Host-site_session';
const OAUTH_COOKIE = '__Secure-site_oauth';
const SESSION_SECONDS = 4 * 60 * 60;
const RETURN_TO_BASE = new URL('https://return-to.invalid');
const encoder = new TextEncoder();

const securityHeaders = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'self' https://github.com; frame-ancestors 'none'; base-uri 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  // The site is unlisted; the gate says so to crawlers too.
  'X-Robots-Tag': 'noindex, nofollow',
};

function base64UrlEncode(value: Uint8Array | string) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function base64UrlDecode(value: string) {
  const padded = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  return new Uint8Array([...binary].map((character) => character.charCodeAt(0)));
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  return base64UrlEncode(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

function secureEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function seal(payload: object, secret: string) {
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${body}.${await sign(body, secret)}`;
}

async function unseal<T>(value: string | undefined, secret: string): Promise<T | null> {
  if (!value) return null;
  const [body, signature, ...extra] = value.split('.');
  if (!body || !signature || extra.length || !secureEqual(signature, await sign(body, secret))) return null;
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as T;
  } catch {
    return null;
  }
}

function randomValue(bytes = 32) {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function pkceChallenge(verifier: string) {
  return base64UrlEncode(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(verifier))));
}

function cookies(request: Request) {
  const result = new Map<string, string>();
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0) result.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  return result;
}

/**
 * Always `Secure`, even on http://localhost. The `__Host-` / `__Secure-`
 * prefixes are only honoured on cookies that carry the attribute, so dropping
 * it on http makes the browser reject the cookie outright and local OAuth
 * testing can never complete. Browsers treat localhost as a trustworthy origin
 * and accept `Secure` there, so this is correct in both places.
 */
function cookie(name: string, value: string, maxAge: number, path = '/') {
  return `${name}=${value}; Path=${path}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; Secure`;
}

// Control characters (0x00-0x1F, 0x7F) and backslashes never belong in a
// return path; either is a header-injection or open-redirect attempt.
const RETURN_TO_FORBIDDEN = /[\x00-\x1f\x7f\\]/u;

export function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || RETURN_TO_FORBIDDEN.test(value)) return '/';

  try {
    const target = new URL(value, RETURN_TO_BASE);
    if (
      target.origin !== RETURN_TO_BASE.origin ||
      target.pathname.startsWith('//') ||
      target.pathname.startsWith('/auth/')
    ) {
      return '/';
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/';
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * The gate's own pages. Deliberately self-contained — they render before any
 * session exists, so they cannot pull the site's stylesheet through the gate.
 * Neutral styling on purpose; restyle to taste, but keep it inline.
 */
function htmlPage(
  title: string,
  message: string,
  action?: { href: string; label: string },
  status = 200,
) {
  const actionHtml = action ? `<a class="button" href="${action.href}">${action.label}</a>` : '';
  const siteName = escapeHtml(SITE_NAME);
  return new Response(
    `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — ${siteName}</title><style>
:root{color-scheme:light;--ink:#1c1c1e;--paper:#f5f5f3;--accent:#2b5bd7;--line:#e2e2df;--muted:#5c5c60}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:32px;background:var(--paper);color:var(--ink);font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
main{width:min(100%,560px);padding:48px;border:1px solid var(--line);border-radius:12px;background:#fff}
small{display:block;color:var(--accent);font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,monospace}
h1{margin:12px 0 18px;font-size:clamp(28px,6vw,40px);line-height:1.05;letter-spacing:-.012em;font-weight:800}
p{margin:0 0 30px;color:var(--muted)}
.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 28px;border-radius:6px;background:var(--accent);color:#fff;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;font-family:ui-monospace,SFMono-Regular,monospace}
.button:hover{filter:brightness(.9)}
footer{margin-top:34px;padding-top:22px;border-top:1px solid var(--line);color:var(--muted);font-size:13.5px}
</style></head><body><main>
<small>${siteName}</small><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${actionHtml}
<footer>This site is not public. Access is limited to GitHub accounts that can view the private repository.</footer>
</main></body></html>`,
    { status, headers: { ...securityHeaders, 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

function config(env: Env) {
  return {
    clientId: env.GITHUB_APP_CLIENT_ID,
    clientSecret: env.GITHUB_APP_CLIENT_SECRET,
    origin: (env.SITE_ORIGIN ?? DEFAULT_ORIGIN).replace(/\/$/u, ''),
    repository: env.GITHUB_REPOSITORY ?? DEFAULT_REPOSITORY,
    sessionSecret: env.SESSION_SECRET,
  };
}

function hasConfig(env: Env) {
  const value = config(env);
  return Boolean(
    value.clientId && value.clientSecret && value.sessionSecret && value.sessionSecret.length >= 32,
  );
}

function isLocal(request: Request) {
  const hostname = new URL(request.url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

async function beginOAuth(request: Request, env: Env) {
  const settings = config(env);
  const url = new URL(request.url);
  const state = randomValue();
  const codeVerifier = randomValue(48);
  const returnTo = safeReturnTo(url.searchParams.get('return_to'));
  const stateCookie = await seal(
    { codeVerifier, returnTo, state } satisfies OAuthState,
    settings.sessionSecret!,
  );
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', settings.clientId!);
  authorize.searchParams.set('redirect_uri', `${settings.origin}/auth/callback`);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('code_challenge', await pkceChallenge(codeVerifier));
  authorize.searchParams.set('code_challenge_method', 'S256');
  authorize.searchParams.set('allow_signup', 'false');
  return new Response(null, {
    status: 302,
    headers: {
      ...securityHeaders,
      Location: authorize.toString(),
      'Set-Cookie': cookie(OAUTH_COOKIE, stateCookie, 10 * 60, '/auth/'),
    },
  });
}

async function githubJson(url: string, token: string) {
  return fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

async function finishOAuth(request: Request, env: Env) {
  const settings = config(env);
  const url = new URL(request.url);
  const oauth = await unseal<OAuthState>(cookies(request).get(OAUTH_COOKIE), settings.sessionSecret!);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  if (!oauth || !code || !returnedState || !secureEqual(oauth.state, returnedState)) {
    return htmlPage(
      'Sign-in expired',
      'The authorization request could not be verified. Please start again.',
      { href: '/auth/login', label: 'Try again' },
      400,
    );
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: settings.clientId!,
      client_secret: settings.clientSecret!,
      code,
      code_verifier: oauth.codeVerifier,
      redirect_uri: `${settings.origin}/auth/callback`,
    }),
  });
  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    return htmlPage(
      'GitHub sign-in failed',
      'GitHub did not complete the authorization. Please try again.',
      { href: '/auth/login', label: 'Try again' },
      401,
    );
  }

  // Authorization, not just authentication: the account has to be able to read
  // the repository. A 404 from this endpoint is GitHub's "no access" answer.
  const userResponse = await githubJson('https://api.github.com/user', tokenPayload.access_token);
  const user = (await userResponse.json()) as { id?: number; login?: string };
  const repositoryResponse = await githubJson(
    `https://api.github.com/repos/${settings.repository}`,
    tokenPayload.access_token,
  );
  if (!userResponse.ok || !user.id || !user.login || !repositoryResponse.ok) {
    return htmlPage(
      'Repository access required',
      `That GitHub account cannot view ${settings.repository}. Ask a repository administrator for access, then try again.`,
      { href: '/auth/login', label: 'Use another GitHub account' },
      403,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const session = await seal(
    {
      exp: now + SESSION_SECONDS,
      githubId: user.id,
      login: user.login,
      repository: settings.repository,
    } satisfies Session,
    settings.sessionSecret!,
  );
  const headers = new Headers({ ...securityHeaders, Location: safeReturnTo(oauth.returnTo) });
  headers.append('Set-Cookie', cookie(SESSION_COOKIE, session, SESSION_SECONDS));
  headers.append('Set-Cookie', cookie(OAUTH_COOKIE, '', 0, '/auth/'));
  return new Response(null, { status: 302, headers });
}

async function validSession(request: Request, env: Env) {
  const settings = config(env);
  const session = await unseal<Session>(cookies(request).get(SESSION_COOKIE), settings.sessionSecret!);
  const now = Math.floor(Date.now() / 1000);
  return Boolean(
    session &&
      session.exp > now &&
      session.repository === settings.repository &&
      session.login &&
      session.githubId,
  );
}

/**
 * Private content must not sit in a shared cache, so the whole site is served
 * `private, no-store`. It costs a re-download per navigation, which is the
 * right trade while the content is gated. No CSP here on purpose: the site's
 * own pages may load CDN scripts and fonts; the CSP above is for the gate's
 * pages only.
 */
function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!hasConfig(env)) {
      // No credentials: serve the site locally so layout work still works, and
      // refuse everywhere else rather than exposing an ungated deployment.
      if (isLocal(request)) return env.ASSETS.fetch(request);
      return htmlPage(
        'Configuration required',
        'GitHub access control has not been configured for this deployment yet.',
        undefined,
        503,
      );
    }

    if (url.pathname === '/auth/login') {
      const returnTo = encodeURIComponent(safeReturnTo(url.searchParams.get('return_to')));
      return htmlPage(
        'Sign in to continue',
        `Use a GitHub account that can view the private ${config(env).repository} repository.`,
        { href: `/auth/github?return_to=${returnTo}`, label: 'Continue with GitHub' },
      );
    }
    if (url.pathname === '/auth/github') return beginOAuth(request, env);
    if (url.pathname === '/auth/callback') return finishOAuth(request, env);
    if (url.pathname === '/auth/logout') {
      return new Response(null, {
        status: 302,
        headers: {
          ...securityHeaders,
          Location: '/auth/login',
          'Set-Cookie': cookie(SESSION_COOKIE, '', 0),
        },
      });
    }

    if (!(await validSession(request, env))) {
      if (request.headers.get('Accept')?.includes('text/html')) {
        const returnTo = encodeURIComponent(`${url.pathname}${url.search}`);
        return Response.redirect(`${url.origin}/auth/login?return_to=${returnTo}`, 302);
      }
      return new Response('GitHub sign-in required.', { status: 401, headers: securityHeaders });
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
