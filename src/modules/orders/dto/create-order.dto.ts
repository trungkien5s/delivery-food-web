import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: '2025-07-02T14:00:00Z', description: 'Thời gian đặt hàng (optional)' })
  orderTime?: Date;
}
