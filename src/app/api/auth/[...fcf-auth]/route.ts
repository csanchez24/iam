/**
 * -------------------------------------------------------------------------------------------------
 * Fcf-Auth handlers
 * 
 * This module contains all handlers required for the `client/application` to communicate with the
 * authorization server in order to complete the oauth2 flow.
 * -------------------------------------------------------------------------------------------------

 * References:
 * - https://oauth.net/2/access-tokens/
 * - https://oauth.net/2/refresh-tokens/
 * - https://www.oauth.com/oauth2-servers/openid-connect/id-tokens/
 * - https://www.iana.org/assignments/jwt/jwt.xhtml#claims
 *
 */

import type { NextRequest } from 'next/server';
import { GETCallback } from './h-callback';
import { GETLogin } from './h-login';
import { POSTLogout } from './h-logout';

export async function GET(req: NextRequest, { params }: { params: { 'fcf-auth': string[] } }) {
  if (params['fcf-auth'][0] === 'login') {
    return GETLogin(req);
  }
  if (params['fcf-auth'][0] === 'callback') {
    return GETCallback(req);
  }
}

export async function POST(req: NextRequest, { params }: { params: { 'fcf-auth': string[] } }) {
  if (params['fcf-auth'][0] === 'logout') {
    return POSTLogout(req);
  }
}
