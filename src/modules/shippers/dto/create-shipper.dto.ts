import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShipperDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;
}
