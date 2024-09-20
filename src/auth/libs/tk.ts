import type { AccessToken, IdToken, RefreshToken, UserToken } from '../types';
import jwt from 'jsonwebtoken';

type Label = {
  id: number;
  name: string;
  description: string | null;
};

type UserToLabel = {
  userId: number;
  labelId: number;
  user: User;
  label: Label;
};

type User = {
  email: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  middleName: string | null;
  lastName: string;
  password: string;
  phone: string | null;
  image: string | null;
  isActive: boolean | null;
  isAdmin: boolean | null;
  isSuperAdmin: boolean | null;
  usersToLabels?: UserToLabel[];
};

type Application = {
  id: number;
  description: string | null;
  domain: string;
  name: string;
  clientId: string;
  sercretId: string;
  homeUrl: string | null;
  loginUrl: string | null;
  accessTokenExp: number;
  refreshTokenExp: number;
  idTokenExp: number;
};

export class Tk {
  private _user: User;
  private _application: Application;
  private _permissions: string[] = [];
  private _labels: string[] = [];
  private _scope: string;
  private _idToken: string;
  private _accessToken: string;
  private _refreshToken: string;

  constructor(application: Application, user: User, permissions: string[], scope: string) {
    this._user = user;
    this._application = application;
    this._permissions = permissions ?? [];
    this._labels = user.usersToLabels?.map(({ label }) => label.name) ?? [];
    this._scope = scope;
    this._idToken = this._genIdToken();
    this._accessToken = this._genAccessToken();
    this._refreshToken = this._genRefreshToken();
  }

  get user() {
    return { ...this._getCommonUserFields(), id: this._user.id };
  }

  get decodedIdToken() {
    return jwt.decode(this._idToken, { json: true }) as unknown as IdToken;
  }

  get decodedAccessToken() {
    return jwt.decode(this._accessToken, { json: true }) as unknown as AccessToken;
  }

  get decodedRefreshToken() {
    return jwt.decode(this._refreshToken, { json: true }) as unknown as RefreshToken;
  }

  get idToken() {
    return this._idToken;
  }

  get accessToken() {
    return this._accessToken;
  }

  get refreshToken() {
    return this._refreshToken;
  }

  private _getCommonUserFields() {
    return {
      name: this._user.firstName + ' ' + this._user.lastName,
      given_name: this._user.firstName,
      family_name: this._user.lastName,
      email: this._user.email,
      phone: this._user.phone,
      is_admin: this._user.isAdmin,
      is_super_admin: this._user.isSuperAdmin,
      is_active: this._user.isActive,
    } satisfies UserToken;
  }

  private _genIdToken() {
    return jwt.sign(
      {
        ...this._getCommonUserFields(),
        // Subject (whom the token refers to)
        sub: this._user.id,
        // Authorized party (client id)
        azp: this._application.clientId,
        // Issuer (who created and signed this token)
        iss: this._application.domain,
        // Audience (who or what the token is intended for)
        aud: [this._application.clientId],
        // JWT id (unique identifier for this token)
        jti: crypto.randomUUID(),
        // Time when authentication occurred
        auth_time: Date.now() / 1000,
        // Expiration time (in seconds)
        exp: Date.now() / 1000 + this._application.idTokenExp,
        // Issued at (in seconds)
        iat: Date.now() / 1000,
        // Last modification timestamp
        updated_at: Date.now(),
      } satisfies IdToken,
      this._application.sercretId
    );
  }

  private _genAccessToken() {
    return jwt.sign(
      {
        ...this._getCommonTokenClaims(),
        exp: Date.now() / 1000 + this._application.accessTokenExp,
      } satisfies AccessToken,
      this._application.sercretId
    );
  }

  private _genRefreshToken() {
    return jwt.sign(
      {
        ...this._getCommonTokenClaims(),
        exp: Date.now() / 1000 + this._application.refreshTokenExp,
      } satisfies RefreshToken,
      this._application.sercretId
    );
  }

  private _getCommonTokenClaims() {
    return {
      sub: this._user.id,
      azp: this._application.clientId,
      iss: this._application.domain,
      jti: crypto.randomUUID(),
      iat: Date.now() / 1000,
      permissions: this._permissions,
      labels: this._labels,
      isAdmin: this._user.isAdmin,
      isSuperAdmin: this._user.isSuperAdmin,
      scope: this._scope,
    };
  }
}
