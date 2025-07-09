import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
  ) {}

  create(dto: CreateRestaurantDto) {
    return this.restaurantModel.create(dto);
  }

  findAll() {
    return this.restaurantModel.find().exec();
  }

  findOne(id: string) {
    return this.restaurantModel.findById(id).exec();
  }

  update(id: string, dto: UpdateRestaurantDto) {
    return this.restaurantModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  remove(id: string) {
    return this.restaurantModel.findByIdAndDelete(id).exec();
  }
}
