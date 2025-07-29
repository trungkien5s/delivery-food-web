import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class UpdateUserDto {

  @IsOptional()
  name: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;

  @IsOptional()
  image: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(['USERS', 'ADMIN'], { message: 'role phải là USERS hoặc ADMIN' })
  role?: string;
}
