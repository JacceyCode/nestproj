import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { JwtPayloadType } from './auth/types';

interface AuthenticatedRequest extends Request {
  user?: JwtPayloadType;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('check-version')
  checkVersion1(): string {
    return this.appService.getVersion1();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() request: AuthenticatedRequest): JwtPayloadType | null {
    return request.user ?? null;
  }
}
