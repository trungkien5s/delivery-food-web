import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu.item.schema';
import { CreateMenuItemDto } from './dto/create-menu.item.dto';
import { UpdateMenuItemDto } from './dto/update-menu.item.dto';
import { Menu, MenuDocument } from '../menus/schemas/menu.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { v2 as cloudinaryLib } from 'cloudinary';
import * as fs from 'fs';


@Injectable()
export class MenuItemsService {
constructor(
  @InjectModel(MenuItem.name)
  private menuItemModel: Model<MenuItemDocument>,
  @InjectModel(Menu.name)
  private menuModel: Model<MenuDocument>, 
  @InjectModel(Category.name)
  private categoryModel: Model<CategoryDocument>, 
    @Inject('CLOUDINARY')
    private cloudinary: typeof cloudinaryLib,
  ) {}

  async create(dto: CreateMenuItemDto, file?: Express.Multer.File) {
    const { menu, categoryId } = dto;

    if (!isValidObjectId(menu)) throw new NotFoundException('Menu ID không hợp lệ');
    const menuExists = await this.menuModel.findById(menu);
    if (!menuExists) throw new NotFoundException('Không tìm thấy menu');

    if (categoryId) {
      if (!isValidObjectId(categoryId)) throw new NotFoundException('Category ID không hợp lệ');
      const categoryExists = await this.categoryModel.findById(categoryId);
      if (!categoryExists) throw new NotFoundException('Không tìm thấy danh mục');
    }

  
      let imageUrl: string | undefined;
  
      if (file) {
        const result = await this.cloudinary.uploader.upload(file.path, {
          folder: 'menu-items',
        });
        imageUrl = result.secure_url;
  
        // xoá file tạm sau khi upload
        fs.unlinkSync(file.path);
      }

        const dataToSave = {
    ...dto,
    image: imageUrl,
  };
    return this.menuItemModel.create(dataToSave);
  }


  findAll() {
    return this.menuItemModel.find().populate('menu');
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const item = await this.menuItemModel.findById(id).populate('menu');
    if (!item) throw new NotFoundException('Không tìm thấy menu item');
    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const updated = await this.menuItemModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Không tìm thấy để cập nhật');
    return updated;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const deleted = await this.menuItemModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Không tìm thấy để xoá');
    return { message: 'Xoá thành công' };
  }
}
