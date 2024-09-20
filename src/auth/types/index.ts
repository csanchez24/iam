export type StateCookie = {
  id: string;
  postLoginRedirectUrl: string;
};

export type UserCookie = {
  id: number;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  phone?: string;
  is_active?: boolean;
  is_admin?: boolean;
  is_super_admin?: boolean;
};

export type SessionCookieName =
  | 'fcf_iam_id_token'
  | 'fcf_iam_access_token'
  | 'fcf_iam_user'
  | 'fcf_iam_refresh_token'
  | 'fcf_iam_state';

export type JwtPayload = {
  iss: string;
  sub: number;
  exp: number;
  iat: number;
  jti: string;
  aud?: string | string[] | undefined;
  nbf?: number | undefined;
  azp?: string | undefined;
};

export type UserToken = {
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  phone: string | undefined | null;
  is_admin: boolean | undefined | null;
  is_super_admin: boolean | undefined | null;
  is_active: boolean | undefined | null;
};

export type AccessToken = JwtPayload & {
  permissions: string[];
  labels: string[];
  scope: string;
};

export type RefreshToken = JwtPayload & {
  permissions: string[];
  labels: string[];
  scope: string;
};

export type IdToken = JwtPayload &
  UserToken & {
    auth_time: number;
    updated_at: number;
  };
