// src/modules/menus/menus.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { RestaurantsModule } from '@/modules/restaurants/restaurants.module'; // 👈 import vào

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
    ]),
    RestaurantsModule, 
  ],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
