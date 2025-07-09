import { Restaurant } from "./restaurant.entity";

export interface RestaurantRepository {
  save(restaurant: Restaurant): Promise<Restaurant>;
  findById(id: string): Promise<Restaurant | null>;
  findByEmail(email: string): Promise<Restaurant | null>;
  findAll(): Promise<Restaurant[]>;
  update(id: string, restaurant: Restaurant): Promise<Restaurant | null>;
  delete(id: string): Promise<boolean>;
}
