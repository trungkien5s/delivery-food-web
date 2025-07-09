import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMenuItemOptionDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Trân châu', description: 'Tên tuỳ chọn' })
  name: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 5000, description: 'Giá tăng thêm khi chọn tuỳ chọn', required: false })
  priceAdjustment: number;

  @IsNotEmpty()
  @ApiProperty({ example: '664f9c47e75f3c24f430ecb7', description: 'ID của menuItem liên kết' })
  menuItem: string;
}
