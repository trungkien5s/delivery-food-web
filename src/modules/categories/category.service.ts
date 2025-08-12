// categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MenuItem } from '@/modules/menu.items/schemas/menu.item.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItem>,
  ) {}

  async create(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto);
  }

  async findAll() {
    return this.categoryModel.find().sort({ name: 1 });
  }

async findOne(id: string) {
  if (!isValidObjectId(id)) throw new NotFoundException('Category not found');

  const doc: any = await this.categoryModel
    .findById(id)
    .populate({
      path: 'menuItems',
      // thêm title/name để có tên món
      select: '_id title name description basePrice price menu restaurant image createdAt updatedAt',
      options: { sort: { title: 1, name: 1 } },
      populate: [
        // cần tên menu: cho phép cả name/title
        { path: 'menu', select: '_id name title' },
        { path: 'restaurant', select: '_id name address isOpen' },
      ],
    })
    .lean();

  if (!doc) throw new NotFoundException('Category not found');

  // Chuẩn hoá tên món để FE dùng ổn định
  const items = (doc.menuItems ?? []).map((it: any) => ({
    ...it,
  }));

  // Nhóm theo menu
  const menusMap = new Map<string, { _id: any; name: string; items: any[] }>();
  for (const it of items) {
    const m = it.menu;
    if (!m?._id) continue;
    const key = String(m._id);
    const menuName = m.name ?? m.title ?? 'Menu';
    if (!menusMap.has(key)) menusMap.set(key, { _id: m._id, name: menuName, items: [] });
    menusMap.get(key)!.items.push(it);
  }

  return {
    _id: doc._id,
    name: doc.name,
    slug: doc.slug,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    menus: Array.from(menusMap.values()),
    menuItems: items, // mỗi item có displayName
  };
}


  async update(id: string, dto: UpdateCategoryDto) {
    const updated = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Category not found');
    return updated;
  }

  async remove(id: string) {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Category not found');
    return result;
  }
}
 