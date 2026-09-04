import assert from 'node:assert/strict';
import test from 'node:test';

import { safeReturnTo } from '../worker/index.ts';

test('accepts and canonicalizes local return paths', () => {
  const cases = [
    ['/', '/'],
    ['/about', '/about'],
    ['/about?plan=1', '/about?plan=1'],
    ['/about?plan=1#details', '/about?plan=1#details'],
    ['/family/../about?plan=1', '/about?plan=1'],
  ];

  for (const [value, expected] of cases) {
    assert.equal(safeReturnTo(value), expected);
  }
});

test('rejects external, ambiguous, control-character, and auth return targets', () => {
  const cases = [
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '///evil.example',
    '/\\evil.example',
    '/safe' + String.fromCharCode(13, 10) + 'X-Evil: yes',
    '/safe' + String.fromCharCode(0) + 'suffix',
    '/auth/login',
    '/auth/github',
    '/auth/callback',
    '/foo/../auth/logout',
    '/..//evil.example',
  ];

  for (const value of cases) {
    assert.equal(safeReturnTo(value), '/');
  }
});

test('rejects the URLSearchParams-decoded backslash redirect payload', () => {
  const request = new URL('__SITE_ORIGIN__/auth/login?return_to=%2F%5Cevil.example');
  const returnTo = safeReturnTo(request.searchParams.get('return_to'));

  assert.equal(returnTo, '/');
  assert.equal(new URL(returnTo, request.origin).origin, request.origin);
});
