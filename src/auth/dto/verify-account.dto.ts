// src/modules/auth/dto/verify-account.dto.ts
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyAccountDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  activationCode: string;
}
