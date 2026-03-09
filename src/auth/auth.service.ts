import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO } from './dto/login-dto';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { setJwtCookie } from 'src/common/utils/cookie.util';
import { v4 as uuidv4 } from 'uuid';
import { ArtistService } from 'src/artist/artist.service';
import { Enable2FAType, JwtPayloadType } from './types';
import * as speakeasy from 'speakeasy';
import { UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly artistService: ArtistService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    loginDTO: LoginDTO,
    response: Response,
  ): Promise<{
    access_token: string;
    validate2FA?: string;
    message?: string;
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

    const loginResponse: {
      access_token: string;
      validate2FA?: string;
      message?: string;
    } = {
      access_token,
    };

    if (user.enable2FA && user.twoFASecret) {
      const base_url =
        this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';

      loginResponse.validate2FA = `${base_url}/api/v1.0/auth/validate-2fa`;
      loginResponse.message =
        'Please send the OTP from your 2FA app to validate your login.';
    }

    return loginResponse;
  }

  async enable2FA(userId: number): Promise<Enable2FAType> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.enable2FA) {
      return {
        secret: user.twoFASecret!,
      };
    }

    const secret = speakeasy.generateSecret();

    await this.userService.updateSecretKey(user.id, secret.base32);

    return { secret: secret.base32 };
  }

  async validate2FAToken(
    userId: number,
    token: string,
  ): Promise<{ verified: boolean }> {
    try {
      const user = await this.userService.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.enable2FA || !user.twoFASecret) {
        throw new UnauthorizedException('2FA not enabled for this user.');
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token,
      });

      return { verified: verified };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      throw new UnauthorizedException('Error verifying 2FA token: ' + message);
    }
  }

  async disable2FA(userId: number): Promise<UpdateResult> {
    return this.userService.disable2FA(userId);
  }

  async validateUserByApiKey(apiKey: string): Promise<User | null> {
    return this.userService.findByApiKey(apiKey);
  }
}
