import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateUserDTO } from 'src/user/dto/create-user-dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login-dto';
import type { Response } from 'express';

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
}
