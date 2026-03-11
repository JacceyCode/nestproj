import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ArtistService } from './artist.service';
import { Artist } from './artist.entity';
import type { Request } from 'express';
import { JwtPayloadType } from 'src/auth/types';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user?: JwtPayloadType;
}

@Controller('artist')
@ApiTags('Artist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth-header')
@ApiCookieAuth('nestproj')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get()
  findArtist(@Req() request: AuthenticatedRequest): Promise<Artist | null> {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const userId = user.userId;

    return this.artistService.findArtist(userId);
  }

  @Post('create')
  createArtist(@Req() request: AuthenticatedRequest): Promise<Artist> {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.artistId) {
      throw new Error('User is already an artist');
    }

    const userId = user.userId;

    return this.artistService.createArtist(userId);
  }
}
