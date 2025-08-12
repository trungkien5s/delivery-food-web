// src/modules/cart_items/cart.items.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartItemsService } from './cart.items.service';
import { CartItemsController } from './cart.items.controller';

import { CartItem, CartItemSchema } from './schemas/cart.items.schema';
import { MenuItem, MenuItemSchema } from '@/modules/menu.items/schemas/menu.item.schema';
import { MenuItemOption, MenuItemOptionSchema } from '@/modules/menu.item.options/schemas/menu.item.option.schema';
import { Cart, CartSchema } from '../carts/schemas/carts.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/schemas/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
      { name: Cart.name, schema: CartSchema }, // Thêm dòng này
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuItemOption.name, schema: MenuItemOptionSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}
