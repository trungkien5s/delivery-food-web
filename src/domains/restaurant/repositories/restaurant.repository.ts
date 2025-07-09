import { Restaurant } from '../entities/restaurant.entity';

export abstract class RestaurantRepository {
  abstract create(restaurant: Partial<Restaurant>): Promise<Restaurant>;
  abstract findAll(): Promise<Restaurant[]>;
  abstract findById(id: string): Promise<Restaurant>;
  abstract update(id: string, restaurant: Partial<Restaurant>): Promise<Restaurant>;
  abstract delete(id: string): Promise<Restaurant>;
}
