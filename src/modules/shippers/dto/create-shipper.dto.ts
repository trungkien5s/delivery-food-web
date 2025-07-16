import { IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShipperDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+84901234567' })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ (phải theo định dạng VN)' })
  phone: string;
}
