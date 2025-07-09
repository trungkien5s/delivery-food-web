import { RestaurantRepository } from '@/domains/restaurant/repositories/restaurant.repository';
import { Restaurant } from '@/modules/restaurants/domain/restaurant.entity';
import { Injectable } from '@nestjs/common';


@Injectable()
export class RestaurantService {
  constructor(private readonly repo: RestaurantRepository) {}

  create(data: Partial<Restaurant>) {
    return this.repo.create(data);
  }

  findAll() {
    return this.repo.findAll();
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, data: Partial<Restaurant>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}