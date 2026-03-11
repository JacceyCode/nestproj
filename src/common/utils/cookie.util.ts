import 'dotenv/config';
import { Request, Response } from 'express';
import { JWT_COOKIE_OPTIONS } from '../constants/cookie-options';

const COOKIE_NAME = process.env.COOKIE_NAME || 'nestproj';

export const setJwtCookie = (res: Response, jwtToken: string) =>
  res.cookie(COOKIE_NAME, jwtToken, JWT_COOKIE_OPTIONS);

export const clearJwtCookie = (res: Response) =>
  res.clearCookie(COOKIE_NAME, {
    ...JWT_COOKIE_OPTIONS,
    maxAge: 0,
  });

export const getJwtFromCookie = (req: Request): string | null => {
  let token: string | null = null;

  if (req && req.signedCookies && req.signedCookies[COOKIE_NAME]) {
    token = req.signedCookies[COOKIE_NAME] as string;
  }

  return token;
};
