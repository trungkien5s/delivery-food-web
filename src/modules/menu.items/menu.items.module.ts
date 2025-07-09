import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Menu, MenuSchema } from '@/modules/menus/schemas/menu.schema';
import { MenuItem, MenuItemSchema } from './schemas/menu.item.schema';
import { MenuItemsController } from './menu.items.controller';
import { MenuItemsService } from './menu.items.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Menu.name, schema: MenuSchema }, // 👈 THÊM DÒNG NÀY
    ]),
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
