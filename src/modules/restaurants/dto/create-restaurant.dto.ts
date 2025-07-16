import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Phở Thìn', description: 'Tên nhà hàng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Quán ăn nổi tiếng chuyên món Phở', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'pho@restaurant.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '123 Lý Thường Kiệt, Q.10', required: false })
  @IsOptional()
  @IsString()
  address?: string;


  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiProperty({ example: '08:00', required: false })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiProperty({ example: '22:00', required: false })
  @IsOptional()
  @IsString()
  closeTime?: string;
}
