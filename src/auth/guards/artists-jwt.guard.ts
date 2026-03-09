import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JwtPayloadType } from '../types';

@Injectable()
export class ArtistJwtGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: JwtPayloadType): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    if (!user.artistId) {
      throw new UnauthorizedException('User is not an artist');
    }

    return user as TUser;
  }
}
