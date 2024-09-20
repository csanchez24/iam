import type { SessionCookieName } from '../types';

export const ALLOWED_SCOPES = ['email', 'profile', 'openid'];

export const SESSION_COOKIE_NAMES: SessionCookieName[] = [
  'fcf_iam_refresh_token',
  'fcf_iam_access_token',
  'fcf_iam_user',
  'fcf_iam_id_token',
];
