import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Menu, MenuSchema } from '@/modules/menus/schemas/menu.schema';
import { MenuItem, MenuItemSchema } from './schemas/menu.item.schema';
import { MenuItemsController } from './menu.items.controller';
import { MenuItemsService } from './menu.items.service';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Menu.name, schema: MenuSchema },
      {name: Category.name, schema: CategorySchema}
    ]),
    CloudinaryModule,
    MulterModule.register({
          dest: './uploads/menu-items',
        }),
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
