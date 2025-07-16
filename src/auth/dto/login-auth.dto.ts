import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email của người dùng' })
  @IsNotEmpty({ message: 'email không được để trống' })
  username: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'password không được để trống' })
  password: string;
}
