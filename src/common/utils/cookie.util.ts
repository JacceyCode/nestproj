import 'dotenv/config';
import { Response } from 'express';
import { JWT_COOKIE_OPTIONS } from '../constants/cookie-options';

const COOKIE_NAME = process.env.COOKIE_NAME || 'NESTPROJ';

export const setJwtCookie = (res: Response, jwtToken: string) =>
  res.cookie(COOKIE_NAME, jwtToken, JWT_COOKIE_OPTIONS);

export const clearJwtCookie = (res: Response) =>
  res.clearCookie(COOKIE_NAME, {
    ...JWT_COOKIE_OPTIONS,
    maxAge: 0,
  });
