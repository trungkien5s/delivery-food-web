import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ example: '662f4d27b9f8a1e05e1c1111', description: 'ID menu cha' })
  menu: string;

  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ example: '662f4d27b9f8a1e05e1c2222', description: 'ID nhà hàng' })
  restaurant: string;

  @IsOptional()
  @IsMongoId()
  @ApiProperty({ example: '662f4d27b9f8a1e05e1c3333', description: 'ID danh mục món ăn' })
  categoryId?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Bún bò Huế', description: 'Tên món ăn' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Đặc sản Huế thơm ngon', description: 'Mô tả món ăn' })
  description?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 45000, description: 'Giá gốc món ăn' })
  basePrice: number;


}
