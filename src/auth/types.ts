export interface JwtPayloadType {
  userId: number;
  email: string;
  artistId?: number;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface Enable2FAType {
  secret: string;
}
