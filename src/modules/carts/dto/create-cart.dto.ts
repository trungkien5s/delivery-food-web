import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCartDto {
  @IsOptional() // vì bạn gán trong backend
  @ApiProperty({ example: 'userId', description: 'ID người dùng', required: false })
  user?: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'restaurantId', description: 'ID nhà hàng' })
  restaurant: string;
}
