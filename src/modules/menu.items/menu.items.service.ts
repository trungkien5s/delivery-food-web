import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu.item.schema';
import { CreateMenuItemDto } from './dto/create-menu.item.dto';
import { UpdateMenuItemDto } from './dto/update-menu.item.dto';
import { Menu, MenuDocument } from '../menus/schemas/menu.schema';


@Injectable()
export class MenuItemsService {
constructor(
  @InjectModel(MenuItem.name)
  private menuItemModel: Model<MenuItemDocument>,
  @InjectModel(Menu.name)
  private menuModel: Model<MenuDocument>, // 👈 thêm dòng này
) {}

async create(dto: CreateMenuItemDto) {
  const { menu } = dto;

  if (!isValidObjectId(menu)) {
    throw new NotFoundException('Menu ID không hợp lệ');
  }

  const menuExists = await this.menuModel.findById(menu);
  if (!menuExists) {
    throw new NotFoundException('Không tìm thấy menu để liên kết');
  }

  return this.menuItemModel.create(dto);
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
