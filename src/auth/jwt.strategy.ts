import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getJwtFromCookie } from 'src/common/utils/cookie.util';
import { validate as validateUUId } from 'uuid';

interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        // Check cookie first, then fallback to Authorization header
        const tokenFromCookie = getJwtFromCookie(req);

        console.log(
          'Extracting JWT from request in jwt.strategy.ts file.........',
        );
        console.log('Token from cookie:', tokenFromCookie);

        if (tokenFromCookie) {
          return tokenFromCookie;
        }

        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default_secret'),
      algorithms: ['HS256'],
      issuer: configService.get<string>('JWT_ISSUER', 'default_issuer'),
      audience: configService.get<string>('JWT_AUDIENCE', 'default_audience'),
    });
  }

  validate(payload: JwtPayload) {
    if (!validateUUId(payload.jti)) {
      throw new UnauthorizedException(
        'Invalid token: jti claim is not a valid UUID',
      );
    }

    return { userId: payload.sub, email: payload.email };
  }
}
