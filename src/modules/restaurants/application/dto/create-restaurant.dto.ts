import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  closeTime?: string;
}