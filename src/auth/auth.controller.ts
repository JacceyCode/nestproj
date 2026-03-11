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
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Enable2FAType, JwtPayloadType } from './types';
import { ValidateTokenDTO } from './dto/validate-token.dto';
import { UpdateResult } from 'typeorm';
import { HttpBearerGuard } from './guards/http-bearer.guard';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadType;
}

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  signup(@Body() userDTO: CreateUserDTO): Promise<User> {
    return this.userService.create(userDTO);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'It gives access_token and sends OTP for verification',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  login(
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDTO, response);
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth-header')
  @ApiCookieAuth('nestproj')
  @ApiOperation({ summary: 'Enable Two-Factor Authentication (2FA)' })
  @ApiResponse({
    status: 200,
    description: '2FA enabled successfully, returns QR code and secret',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  enable2FA(@Request() req: AuthenticatedRequest): Promise<Enable2FAType> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.enable2FA(user.userId);
  }

  @Get('disable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth-header')
  @ApiCookieAuth('nestproj')
  @ApiOperation({ summary: 'Disable Two-Factor Authentication (2FA)' })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  disable2FA(@Request() req: AuthenticatedRequest): Promise<UpdateResult> {
    return this.authService.disable2FA(req.user!.userId);
  }

  @Post('validate-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth-header')
  @ApiCookieAuth('nestproj')
  @ApiOperation({ summary: 'Validate Two-Factor Authentication (2FA) token' })
  @ApiResponse({
    status: 200,
    description: '2FA token validated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Get('profile')
  @UseGuards(HttpBearerGuard)
  @ApiBearerAuth('JWT-auth-header')
  @ApiCookieAuth('nestproj')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user profile',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      msg: 'Authenticated with API Key',
      user,
    };
  }
}
