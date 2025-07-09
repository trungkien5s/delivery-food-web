import { IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthDto {
    @ApiProperty({ example: 'user@example.com', description: 'Địa chỉ email của người dùng' })
    @IsNotEmpty({ message: "email không được để trống" })
    email: string;

    @ApiProperty({ example: '123456', description: 'Mật khẩu của người dùng' })
    @IsNotEmpty({ message: "password không được để trống" })
    password: string;

    @ApiPropertyOptional({ example: 'Trung Kiên', description: 'Tên của người dùng (tuỳ chọn)' })
    @IsOptional()
    name: string;
}
