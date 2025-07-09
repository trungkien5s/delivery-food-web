import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateShipperDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ['available', 'delivering', 'offline'] })
  status?: 'available' | 'delivering' | 'offline';

  @ApiPropertyOptional()
  rating?: number;
}