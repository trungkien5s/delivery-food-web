// src/modules/menus/menus.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Menu, MenuDocument } from './schemas/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Restaurant, RestaurantDocument } from '../restaurants/schemas/restaurant.schema';
import * as fs from 'fs';
import { v2 as cloudinaryLib } from 'cloudinary';
@Injectable()
export class MenusService {
constructor(
  @InjectModel(Menu.name)
  private menuModel: Model<MenuDocument>,

  @InjectModel(Restaurant.name)
  private restaurantModel: Model<RestaurantDocument>, 

    @Inject('CLOUDINARY')
    private cloudinary: typeof cloudinaryLib, 
  ) {}

  async create(dto: CreateMenuDto, file?: Express.Multer.File) {
    if (!isValidObjectId(dto.restaurant)) {
      throw new NotFoundException('ID nhà hàng không hợp lệ');
    }

    const restaurant = await this.restaurantModel.findById(dto.restaurant);
    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }

    let imageUrl: string | undefined;

    if (file) {
      const result = await this.cloudinary.uploader.upload(file.path, {
        folder: 'menus',
      });
      imageUrl = result.secure_url;

      // xoá file tạm sau khi upload
      fs.unlinkSync(file.path);
    }

    const created = await this.menuModel.create({
      ...dto,
      image: imageUrl,
    });

    return created;
  }
  async findAll() {
    return this.menuModel.find().populate('restaurant');
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const menu = await this.menuModel.findById(id).populate('restaurant');
    if (!menu) throw new NotFoundException('Không tìm thấy menu');
    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const updated = await this.menuModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Không tìm thấy menu để cập nhật');
    return updated;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const deleted = await this.menuModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Không tìm thấy menu để xoá');
    return { message: 'Xoá menu thành công' };
  }
}
