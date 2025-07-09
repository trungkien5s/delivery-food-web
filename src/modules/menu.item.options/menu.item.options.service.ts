import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateMenuItemOptionDto } from './dto/create-menu.item.option.dto';
import { UpdateMenuItemOptionDto } from './dto/update-menu.item.option.dto';
import { MenuItemOption, MenuItemOptionDocument } from './schemas/menu.item.option.schema';
import { MenuItem, MenuItemDocument } from '../menu.items/schemas/menu.item.schema';

@Injectable()
export class MenuItemOptionsService {
constructor(
  @InjectModel(MenuItemOption.name)
  private optionModel: Model<MenuItemOptionDocument>,

  @InjectModel(MenuItem.name)
  private menuItemModel: Model<MenuItemDocument>, // 👈 inject thêm model MenuItem
) {}


async create(dto: CreateMenuItemOptionDto) {
  const { menuItem } = dto;

  if (!isValidObjectId(menuItem)) {
    throw new NotFoundException('MenuItem ID không hợp lệ');
  }

  const itemExists = await this.menuItemModel.findById(menuItem);
  if (!itemExists) {
    throw new NotFoundException('Không tìm thấy MenuItem để liên kết');
  }

  return this.optionModel.create(dto);
}

  findAll() {
    return this.optionModel.find().populate('menuItem');
  }

  findOne(id: string) {
    return this.optionModel.findById(id).populate('menuItem');
  }

async update(id: string, dto: UpdateMenuItemOptionDto) {
  if (dto.menuItem) {
    if (!isValidObjectId(dto.menuItem)) {
      throw new NotFoundException('MenuItem ID không hợp lệ');
    }

    const itemExists = await this.menuItemModel.findById(dto.menuItem);
    if (!itemExists) {
      throw new NotFoundException('Không tìm thấy MenuItem để cập nhật');
    }
  }

  return this.optionModel.findByIdAndUpdate(id, dto, { new: true });
}


  remove(id: string) {
    return this.optionModel.findByIdAndDelete(id);
  }
}
