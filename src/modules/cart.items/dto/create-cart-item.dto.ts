// create-cart-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ example: '60f71ad23e1d3f001e2d3c5a', description: 'ID món ăn (menuItem)' })
  menuItem: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 2, description: 'Số lượng món ăn' })
  quantity: number;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  @ApiProperty({
    example: ['64ad9f2a4b23b8d3a8c4fa01'],
    description: 'Danh sách ID các tuỳ chọn đã chọn',
    required: false,
  })
  selectedOptions?: string[];
}

export class CreateCartItemsDto {
  @IsArray()
  @ApiProperty({
    type: [CreateCartItemDto],
    description: 'Danh sách các cart item',
  })
  items: CreateCartItemDto[];
}
