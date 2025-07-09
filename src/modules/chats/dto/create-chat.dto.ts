import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn, IsNotEmpty } from "class-validator";

export class CreateChatDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shipper: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  order: string; 

  @ApiProperty({ enum: ['user', 'shipper', 'support'] })
  @IsString()
  @IsIn(['user', 'shipper', 'support'])
  senderRole: 'user' | 'shipper' | 'support';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
