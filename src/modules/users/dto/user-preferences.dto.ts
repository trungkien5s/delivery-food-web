import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsObject, IsString, IsBoolean, IsArray } from 'class-validator';

export class UserPreferencesDto {
  @ApiProperty({
    description: 'Preferred language',
    example: 'vi',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Notification preferences',
    example: {
      email: true,
      push: true,
      sms: false
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };

  @ApiProperty({
    description: 'Dietary restrictions',
    example: ['vegetarian', 'no-spicy'],
    required: false
  })
  @IsOptional()
  @IsArray()
  dietary?: string[];

  @ApiProperty({
    description: 'Default delivery address',
    required: false
  })
  @IsOptional()
  @IsObject()
  defaultAddress?: {
    street: string;
    city: string;
    district: string;
    ward: string;
    coordinates: [number, number];
  };
}