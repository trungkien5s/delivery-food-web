import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (JPEG, PNG, GIF)',
  })
  avatar: Express.Multer.File;
}
