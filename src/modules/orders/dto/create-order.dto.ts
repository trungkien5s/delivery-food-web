import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ 
    description: 'Array of CartItem IDs to create order from',
    example: ['64e3c4ba1f9b8b001a0c1234', '64e3c4ba1f9b8b001a0c5678'],
    type: [String]
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  cartItemIds: string[];

  @ApiPropertyOptional({ 
    description: 'Optional order time (defaults to current time)',
    example: '2025-07-02T09:58:01.044Z'
  })
  @IsOptional()
  @IsDateString()
  orderTime?: Date;
}