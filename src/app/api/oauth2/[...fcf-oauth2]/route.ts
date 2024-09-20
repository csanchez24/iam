import type { NextRequest } from 'next/server';

import { GETAuthorize } from './h-authorize';
import { POSTLogin } from './h-login';
import { POSTLogout } from './h-logout';
import { POSTPasswordReset } from './h-password-reset';
import { POSTPasswordResetCode } from './h-password-reset-code';
import { POSTPasswordResetConfirm } from './h-password-reset-confirm';
import { POSTToken } from './h-token';

export async function GET(req: NextRequest, { params }: { params: { 'fcf-oauth2': string[] } }) {
  if (params['fcf-oauth2'][0] === 'authorize') {
    return GETAuthorize(req);
  }
}

export async function POST(req: NextRequest, { params }: { params: { 'fcf-oauth2': string[] } }) {
  if (params['fcf-oauth2'][0] === 'login') {
    return POSTLogin(req);
  }
  if (params['fcf-oauth2'][0] === 'logout') {
    return POSTLogout(req);
  }
  if (params['fcf-oauth2'][0] === 'token') {
    return POSTToken(req);
  }
  if (params['fcf-oauth2'][0] === 'password-reset') {
    return POSTPasswordReset(req);
  }
  if (params['fcf-oauth2'][0] === 'password-reset-code') {
    return POSTPasswordResetCode(req);
  }
  if (params['fcf-oauth2'][0] === 'password-reset-confirm') {
    return POSTPasswordResetConfirm(req);
  }
}
