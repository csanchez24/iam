import type { SessionCookieName, StateCookie, UserCookie } from '../types';
import { env } from '@/env';
import { cookies } from 'next/headers';

export type CookieOptions = Parameters<ReturnType<typeof cookies>['set']>[2];

export class SessionManager {
  private _COMMON_COOKIE_OPTIONS = {
    sameSite: 'lax',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    path: '/',
  } satisfies Partial<CookieOptions>;

  private _COOKIES: SessionCookieName[] = [
    'fcf_iam_id_token',
    'fcf_iam_access_token',
    'fcf_iam_user',
    'fcf_iam_refresh_token',
    'fcf_iam_state',
  ];

  options: CookieOptions;

  constructor(options: CookieOptions = {}) {
    this.options = {
      ...this._COMMON_COOKIE_OPTIONS,
      ...options,
    };
  }

  getSession(key: Extract<SessionCookieName, 'fcf_iam_state'>): StateCookie | undefined;
  getSession(key: Extract<SessionCookieName, 'fcf_iam_user'>): UserCookie | undefined;
  getSession(key: Extract<SessionCookieName, 'fcf_iam_id_token' | 'fcf_iam_access_token' | 'fcf_iam_refresh_token'>): string | undefined // prettier-ignore
  getSession(key: SessionCookieName): StateCookie | UserCookie | string | undefined {
    const cookie = cookies().get(key);
    if (!cookie) return;
    try {
      const value = JSON.parse(cookie.value) as StateCookie | UserCookie;

      switch (key) {
        case 'fcf_iam_state':
          return value as StateCookie;
        case 'fcf_iam_user':
          return value as UserCookie;
        case 'fcf_iam_id_token':
        case 'fcf_iam_access_token':
        case 'fcf_iam_refresh_token':
          return cookie.value;
      }
    } catch (error) {
      return cookie.value;
    }
  }

  setSession(key: Extract<SessionCookieName, 'fcf_iam_state'>, value: StateCookie): void;
  setSession(key: Extract<SessionCookieName, 'fcf_iam_user'>, value: UserCookie): void;
  setSession(key: Extract<SessionCookieName, 'fcf_iam_id_token' | 'fcf_iam_access_token' | 'fcf_iam_refresh_token'>, value: string): void; // prettier-ignore
  setSession(key: string, value: StateCookie | UserCookie | string) {
    const cookieStore = cookies();
    if (value !== undefined) {
      cookieStore.set(key, typeof value === 'object' ? JSON.stringify(value) : value, {
        ...this._COMMON_COOKIE_OPTIONS,
        domain: undefined, // come up with a way to put domain here
        // maxAge: TWENTY_NINE_DAYS, // we want session right?
      });
    }
  }

  removeSession(key: SessionCookieName) {
    const cookieStore = cookies();
    cookieStore.set(key, '', {
      ...this._COMMON_COOKIE_OPTIONS,
      maxAge: 0,
      // domain: config.cookieDomain ? config.cookieDomain : undefined, // I don't know abou this yet
    });
  }

  destroySession() {
    const cookieStore = cookies();
    this._COOKIES.forEach((name) =>
      cookieStore.set(name, '', {
        ...this._COMMON_COOKIE_OPTIONS,
        maxAge: 0,
        // domain: config.cookieDomain ? config.cookieDomain : undefined,
      })
    );
  }
}
