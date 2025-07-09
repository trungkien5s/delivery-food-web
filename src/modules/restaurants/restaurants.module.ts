import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantsService } from './restaurants.service';
import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';
import { RestaurantsController } from './restaurants.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }])
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
    exports: [MongooseModule], // 👈 xuất để module khác dùng

})
export class RestaurantsModule {}
