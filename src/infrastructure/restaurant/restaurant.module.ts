import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantMongoRepository } from '../../domains/restaurant/repositories/restaurant-mongo.repository';
import { RestaurantController } from '@/interfaces/restaurant/restaurant.controller';
import { RestaurantService } from '@/use-cases/restaurant/restaurant.service';
import { RestaurantSchema } from '../database/schemas/restaurant.schema';
import { Restaurant } from '@/domains/restaurant/entities/restaurant.entity';


@Module({
  imports: [
MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }])  ],
  controllers: [RestaurantController],
  providers: [
    RestaurantService,
    {
      provide: 'RestaurantRepository',
      useClass: RestaurantMongoRepository,
    },
  ],
})
export class RestaurantModule {}