import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login-dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(loginDTO: LoginDTO): Promise<User> {
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

    // return user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...safeUser } = user;

    return safeUser as User;
  }
}
