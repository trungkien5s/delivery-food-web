import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateShipperDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty({ description: 'Shipper có đang online hay không' })
  @IsBoolean()
  isOnline: boolean;

  @ApiPropertyOptional()
  rating?: number;
}