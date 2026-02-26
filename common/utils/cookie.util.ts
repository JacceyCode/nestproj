import 'dotenv/config';
import { JWT_COOKIE_OPTIONS } from 'common/constants/cookie-options';
import { Response } from 'express';

const COOKIE_NAME = process.env.COOKIE_NAME || 'NESTPROJ';

export const setJwtCookie = (res: Response, jwtToken: string) =>
  res.cookie(COOKIE_NAME, jwtToken, JWT_COOKIE_OPTIONS);

export const clearJwtCookie = (res: Response) =>
  res.clearCookie(COOKIE_NAME, {
    ...JWT_COOKIE_OPTIONS,
    maxAge: 0,
  });
