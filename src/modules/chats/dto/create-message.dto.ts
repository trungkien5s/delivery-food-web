import { IsArray, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsEnum(['support', 'order'])
  type: 'support' | 'order';

  @IsArray()
  @IsMongoId({ each: true })
  participants: string[];

  @IsEnum(['user-support', 'user-shipper', 'shipper-support'])
  relationType: 'user-support' | 'user-shipper' | 'shipper-support';

  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @IsOptional()
  @IsString()
  title?: string;
}