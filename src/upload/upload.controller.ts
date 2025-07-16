// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as Cloudinary } from 'cloudinary';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('upload')
export class UploadController {
  constructor(
    @Inject('CLOUDINARY') private cloudinary: typeof Cloudinary,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinary.uploader.upload(file.path, {
      folder: 'cloud',
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }
}
