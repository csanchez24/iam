import { z } from 'zod';

export const AuthLoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const AuthOAuth2AuthorizeQuerySchema = z.object({
  response_type: z.enum(['code', 'token']),
  client_id: z.string().min(1),
  redirect_uri: z.string().url(),
  scope: z.string().min(1), // openid, profile, email
  state: z.string().min(1),
});

export const AuthOAuth2TokenQuerySchema = z.object({
  code: z.string().uuid(),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  redirect_uri: z.string().url(),
  grant_type: z.enum(['authorization_code', 'refresh_token']),
});

export const AuthPasswordResetBodySchema = z.object({
  email: z.string().email(),
});

export const AuthPasswordResetCodeBodySchema = z.object({
  code: z.string().min(6),
});

export const AuthPasswordResetConfirmBodySchema = z.object({
  password: z.string().min(6),
  passwordConfirmation: z.string().min(6),
});
