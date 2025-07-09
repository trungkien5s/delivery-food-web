import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantRepository } from '../../../domains/restaurant/repositories/restaurant.repository';
import { Restaurant } from '../../../domains/restaurant/entities/restaurant.entity';
import { RestaurantSchemaClass } from '@/infrastructure/database/schemas/restaurant.schema';
import { RestaurantDocument } from '@/modules/restaurants/schemas/restaurant.schema';

@Injectable()
export class RestaurantMongoRepository extends RestaurantRepository {
  constructor(
    @InjectModel(RestaurantSchemaClass.name)
    private readonly model: Model<RestaurantDocument>
  ) {
    super();
  }

  async create(data: Partial<Restaurant>): Promise<Restaurant> {
    const created = await this.model.create(data);
    return new Restaurant(created._id.toString(), created.name, created.description, created.phone, created.email, created.address, created.image, created.rating, created.isOpen, created.openTime, created.closeTime);
  }

  async findAll(): Promise<Restaurant[]> {
    const result = await this.model.find().exec();
    return result.map(r => new Restaurant(r._id.toString(), r.name, r.description, r.phone, r.email, r.address, r.image, r.rating, r.isOpen, r.openTime, r.closeTime));
  }

  async findById(id: string): Promise<Restaurant> {
    const r = await this.model.findById(id).exec();
    if (!r) return null;
    return new Restaurant(r._id.toString(), r.name, r.description, r.phone, r.email, r.address, r.image, r.rating, r.isOpen, r.openTime, r.closeTime);
  }

  async update(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
    const r = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    return new Restaurant(r._id.toString(), r.name, r.description, r.phone, r.email, r.address, r.image, r.rating, r.isOpen, r.openTime, r.closeTime);
  }

  async delete(id: string): Promise<Restaurant> {
    const r = await this.model.findByIdAndDelete(id).exec();
    return new Restaurant(r._id.toString(), r.name, r.description, r.phone, r.email, r.address, r.image, r.rating, r.isOpen, r.openTime, r.closeTime);
  }
}