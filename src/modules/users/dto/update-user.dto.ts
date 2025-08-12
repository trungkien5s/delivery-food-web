import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsMobilePhone,
  IsUrl,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsMobilePhone('vi-VN', {}, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(5, 100)
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL ảnh không hợp lệ' })
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(['USERS', 'ADMIN', 'SHIPPER'], {
    message: 'Role phải là USERS, ADMIN hoặc SHIPPER',
  })
  role?: string;
}
