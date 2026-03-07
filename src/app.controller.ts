import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt.guard';

type RequestUser = {
  userId: number;
  email: string;
};

interface AuthenticatedRequest extends Request {
  user?: RequestUser;
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
  getProfile(@Req() request: AuthenticatedRequest): RequestUser | null {
    return request.user ?? null;
  }
}
