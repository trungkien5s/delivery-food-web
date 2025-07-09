import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDetailDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ example: 'orderId123', description: 'ID đơn hàng' })
  order: string;

  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ example: 'menuItemId123', description: 'ID món ăn' })
  menuItem: string;

  @IsNumber()
  @ApiProperty({ example: 2, description: 'Số lượng món' })
  quantity: number;

  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    example: ['optionId1', 'optionId2'],
    description: 'Danh sách tuỳ chọn đã chọn',
  })
  selectedOptions: string[];

  @IsNumber()
  @ApiProperty({ example: 45000, description: 'Giá cuối cùng của món ăn' })
  price: number;
}
