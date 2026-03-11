import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import bcrypt from 'bcryptjs';
import { LoginDTO } from 'src/auth/dto/login.dto';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userDTO: CreateUserDTO): Promise<User> {
    const user = new User();
    Object.assign(user, userDTO);
    user.apiKey = uuidV4();

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(userDTO.password, salt);

    const createdUser = await this.userRepository.save(user);

    // const { password: _password, ...safeUser } = createdUser; // Remove password before returning the user object

    return createdUser;
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

  async findByApiKey(apiKey: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ apiKey });
  }
}
