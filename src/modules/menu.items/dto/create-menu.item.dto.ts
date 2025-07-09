import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @ApiProperty({ example: '662f4d27b9f8a1e05e1c1111', description: 'ID menu cha' })
  menu: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Bún bò Huế', description: 'Tên món ăn' })
  title: string;

  @IsOptional()
  @ApiProperty({ example: 'Đặc sản Huế thơm ngon', description: 'Mô tả món ăn' })
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 45000, description: 'Giá gốc' })
  basePrice: number;

  @IsOptional()
  @ApiProperty({ example: 'https://image-url.com/image.jpg', description: 'Ảnh minh hoạ món ăn' })
  image?: string;
}
