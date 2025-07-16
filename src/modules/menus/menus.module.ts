import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { RestaurantsModule } from '@/modules/restaurants/restaurants.module';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
    ]),
    RestaurantsModule,
    CloudinaryModule,
    MulterModule.register({
      dest: './uploads/menus',
    }),
  ],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
