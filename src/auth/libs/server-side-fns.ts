/**
 * Server side fns we can use to pull sessions, permissions, user ...
 */

import type { AccessToken, IdToken, RefreshToken, SessionCookieName } from '../types';

import { jwtDecode } from 'jwt-decode';
import { SessionManager } from './session-manager';

export function getUser() {
  const sm = new SessionManager();
  return sm.getSession('fcf_iam_user');
}

export function getPermissions() {
  return getTokenPayload('fcf_iam_access_token')?.permissions ?? [];
}

export function getPermission(key: string) {
  return getPermissions().find((permission) => permission === key);
}

export function getLabels() {
  return getTokenPayload('fcf_iam_access_token')?.labels ?? [];
}

export function getSession() {
  const user = getUser();
  const permissions = getPermissions();
  const labels = getLabels();
  return { user, permissions, labels };
}

export function getTokenPayload(
  token: Extract<SessionCookieName, 'fcf_iam_id_token'>
): undefined | IdToken;
export function getTokenPayload(
  token: Extract<SessionCookieName, 'fcf_iam_access_token'>
): undefined | AccessToken;
export function getTokenPayload(
  token: Extract<SessionCookieName, 'fcf_iam_refresh_token'>
): undefined | RefreshToken;
export function getTokenPayload(
  token: Extract<
    SessionCookieName,
    'fcf_iam_id_token' | 'fcf_iam_access_token' | 'fcf_iam_refresh_token'
  >
): IdToken | AccessToken | RefreshToken | undefined {
  const sm = new SessionManager();
  const tk = sm.getSession(token);
  return tk ? jwtDecode(tk) : undefined;
}
