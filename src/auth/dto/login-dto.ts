import {
  IsAlphanumeric,
  IsByteLength,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @IsByteLength(6, 12)
  password: string;
}
