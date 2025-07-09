// src/modules/users/dto/reset-password.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  resetCode: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
