import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from 'src/user/dto/create-user-dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login-dto';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Enable2FAType, JwtPayloadType } from './types';
import { ValidateTokenDTO } from './dto/validate-token.dto';
import { UpdateResult } from 'typeorm';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadType;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  signup(@Body() userDTO: CreateUserDTO): Promise<User> {
    return this.userService.create(userDTO);
  }

  @Post('login')
  login(
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDTO, response);
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  enable2FA(@Request() req: AuthenticatedRequest): Promise<Enable2FAType> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.enable2FA(user.userId);
  }

  @Get('disable-2fa')
  @UseGuards(JwtAuthGuard)
  disable2FA(@Request() req: AuthenticatedRequest): Promise<UpdateResult> {
    return this.authService.disable2FA(req.user!.userId);
  }

  @Post('validate-2fa')
  @UseGuards(JwtAuthGuard)
  validate2FA(
    @Request() req: AuthenticatedRequest,
    @Body() validateTokenDTO: ValidateTokenDTO,
  ): Promise<{ verified: boolean }> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.validate2FAToken(
      user.userId,
      validateTokenDTO.token,
    );
  }
}
