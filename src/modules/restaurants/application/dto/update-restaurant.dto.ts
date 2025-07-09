import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { Restaurant } from '../../schemas/restaurant.schema';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}

// src/restaurants/application/dto/restaurant-response.dto.ts
export class RestaurantResponseDto {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  image: string;
  rating: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  createdAt: Date;
  updatedAt: Date;

constructor(restaurant: Restaurant & { _id?: any; id?: any }) {
    this.id = restaurant._id?.toString?.();
    this.name = restaurant.name;
    this.description = restaurant.description;
    this.phone = restaurant.phone;
    this.email = restaurant.email;
    this.address = restaurant.address;
    this.image = restaurant.image;
    this.rating = restaurant.rating;
    this.isOpen = restaurant.isOpen;
    this.openTime = restaurant.openTime;
    this.closeTime = restaurant.closeTime;
    this.createdAt = restaurant.createdAt;
    this.updatedAt = restaurant.updatedAt;
  }
}