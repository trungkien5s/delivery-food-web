// src/modules/carts/carts.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart, CartSchema } from './schemas/carts.schema';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import { Restaurant, RestaurantSchema } from '@/modules/restaurants/schemas/restaurant.schema';
import { CartItem, CartItemSchema } from '../cart.items/schemas/cart.items.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: CartItem.name, schema: CartItemSchema }, // nếu có bảng cart item
    ]),
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
