// export interface PayloadType {
//   email: string;
//   userId: number;
//   artistId?: number; // Optional field for artist ID
// }

export interface JwtPayloadType {
  userId: number;
  email: string;
  artistId?: number;
  jti?: string;
  iat?: number;
  exp?: number;
}
