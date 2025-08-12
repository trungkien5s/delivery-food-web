// categories/categories.module.ts
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { Menu, MenuSchema } from '@/modules/menus/schemas/menu.schema';
import { MenuItem, MenuItemSchema } from '@/modules/menu.items/schemas/menu.item.schema';
import { CategoriesService } from './category.service';
import { Module } from '@nestjs/common';
import { CategoriesController } from './category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Menu.name, schema: MenuSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
