import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { v2 as cloudinaryLib } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,

    @Inject('CLOUDINARY')
    private cloudinary: typeof cloudinaryLib,
  ) {}

  async create(dto: CreateRestaurantDto, file?: Express.Multer.File) {
    const { phone, email } = dto;

    if (phone) {
      const phoneExists = await this.restaurantModel.findOne({ phone });
      if (phoneExists) {
        throw new BadRequestException('Số điện thoại đã được sử dụng');
      }
    }

    if (email) {
      const emailExists = await this.restaurantModel.findOne({ email });
      if (emailExists) {
        throw new BadRequestException('Email đã được sử dụng');
      }
    }

  let imageUrl: string | undefined;

  if (file) {
    const uploaded = await this.cloudinary.uploader.upload(file.path, {
      folder: 'restaurants',
    });
    imageUrl = uploaded.secure_url;
    fs.unlinkSync(file.path); 
  }

  const dataToSave = {
    ...dto,
    image: imageUrl,
  };

return this.restaurantModel.create(dataToSave);
  }

  async update(id: string, dto: UpdateRestaurantDto, file?: Express.Multer.File) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID nhà hàng không hợp lệ');
    }

  let imageUrl: string | undefined;

  if (file) {
    const uploaded = await this.cloudinary.uploader.upload(file.path, {
      folder: 'restaurants',
    });
    imageUrl = uploaded.secure_url;
    fs.unlinkSync(file.path); 
  }

  const dataToSave = {
    ...dto,
    image: imageUrl,
  };

    const updated = await this.restaurantModel.findByIdAndUpdate(id, dataToSave, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException('Không tìm thấy nhà hàng để cập nhật');
    }

    return updated;
  }

  async findAll() {
    return this.restaurantModel.find();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID nhà hàng không hợp lệ');
    }

    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }
    return restaurant;
  }



  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID nhà hàng không hợp lệ');
    }

    const deleted = await this.restaurantModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy nhà hàng để xoá');
    }

    return { message: 'Xoá thành công' };
  }
}
