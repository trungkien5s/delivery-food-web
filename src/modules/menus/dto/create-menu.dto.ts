// src/modules/menus/dto/create-menu.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty()
  @ApiProperty({ example: '60f71ad23e1d3f001e2d3c5a', description: 'ID nhà hàng' })
  restaurant: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Combo gà rán', description: 'Tên món ăn hoặc combo' })
  title: string;
}
