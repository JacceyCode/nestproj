import 'dotenv/config';
import { CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';
const domain = isProduction ? process.env.DOMAIN : 'localhost';
const COOKIE_MAX_AGE = process.env.COOKIE_MAX_AGE
  ? parseInt(process.env.COOKIE_MAX_AGE, 10)
  : 1000 * 60 * 60;

export const JWT_COOKIE_OPTIONS: CookieOptions = {
  signed: true,
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE,
  path: '/',
  domain,
};
