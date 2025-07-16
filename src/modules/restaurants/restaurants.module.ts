import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantsService } from './restaurants.service';
import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';
import { RestaurantsController } from './restaurants.controller';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
     CloudinaryModule,
     MulterModule.register({
           dest: './uploads/restaurants',
         }),
  ],
  
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
    exports: [MongooseModule], 

})
export class RestaurantsModule {}
