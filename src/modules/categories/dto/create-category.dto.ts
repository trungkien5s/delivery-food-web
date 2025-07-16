import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Cơm', description: 'Tên danh mục món ăn' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'com', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'https://img.domain.com/icon.png', required: false })
  @IsOptional()
  @IsString()
  iconUrl?: string;
}
