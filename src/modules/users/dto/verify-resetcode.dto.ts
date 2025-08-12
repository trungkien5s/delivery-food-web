import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyResetCodeDto {
  @IsEmail() // <-- viết hoa chữ I
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
