import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login-dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { setJwtCookie } from 'src/common/utils/cookie.util';
import { v4 as uuidv4 } from 'uuid';
import { ArtistService } from 'src/artist/artist.service';
import { JwtPayloadType } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly artistService: ArtistService,
  ) {}

  async login(
    loginDTO: LoginDTO,
    response: Response,
  ): Promise<{
    access_token: string;
    data: User;
  }> {
    const user = await this.userService.findOne(loginDTO);

    // Compare password
    const passwordMatch = await bcrypt.compare(
      loginDTO.password,
      user.password,
    );

    if (!user || !passwordMatch) {
      throw new UnauthorizedException('Invalid user credentials');
    }

    // Generate token
    const payload: JwtPayloadType = {
      email: user.email,
      userId: user.id,
    };

    const artist = await this.artistService.findArtist(user.id);
    if (artist) {
      payload.artistId = artist.id;
    }

    const access_token = await this.jwtService.signAsync(payload, {
      jwtid: uuidv4(), // Add a unique identifier for the token
    });

    // Set Cookie
    setJwtCookie(response, access_token);

    // return user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...safeUser } = user;

    return {
      access_token,
      data: safeUser as User,
    };
  }
}
