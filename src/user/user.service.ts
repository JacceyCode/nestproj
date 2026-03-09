import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user-dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import bcrypt from 'bcryptjs';
import { LoginDTO } from 'src/auth/dto/login-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userDTO: CreateUserDTO): Promise<User> {
    const salt = await bcrypt.genSalt(12);
    userDTO.password = await bcrypt.hash(userDTO.password, salt);

    const user = await this.userRepository.save(userDTO);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...safeUser } = user; // Remove password before returning the user object

    return safeUser as User;
  }

  async findOne(loginDTO: LoginDTO): Promise<User> {
    const user = await this.userRepository.findOneBy({
      email: loginDTO.email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user credentials');
    }

    return user;
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  async updateSecretKey(userId: number, secret: string): Promise<UpdateResult> {
    return this.userRepository.update(
      {
        id: userId,
      },
      {
        twoFASecret: secret,
        enable2FA: true,
      },
    );
  }

  async disable2FA(userId: number): Promise<UpdateResult> {
    return this.userRepository.update(
      {
        id: userId,
      },
      {
        enable2FA: false,
        twoFASecret: null,
      },
    );
  }
}
