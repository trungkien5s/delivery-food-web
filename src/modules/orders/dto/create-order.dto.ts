import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsMongoId } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: '2025-07-02T14:00:00Z', description: 'Thời gian đặt hàng (optional)' })
  orderTime?: Date;

  @ApiProperty({ example: '66f25a1234abc...', description: 'ID nhà hàng muốn đặt' })
  @IsMongoId({ message: 'restaurantId phải là ObjectId hợp lệ' })
  restaurantId: string;
}
