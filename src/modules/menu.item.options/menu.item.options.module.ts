import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemOption, MenuItemOptionSchema } from './schemas/menu.item.option.schema';
import { MenuItem, MenuItemSchema } from '@/modules/menu.items/schemas/menu.item.schema';
import { MenuItemOptionsController } from './menu.item.options.controller';
import { MenuItemOptionsService } from './menu.item.options.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItemOption.name, schema: MenuItemOptionSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuItemOptionsController], 
  providers: [MenuItemOptionsService],      
})
export class MenuItemOptionsModule {}
