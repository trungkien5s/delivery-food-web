import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { Restaurant, RestaurantSchema } from '@/modules/restaurants/schemas/restaurant.schema';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import { Cart, CartSchema } from '../carts/schemas/carts.schema';
import { CartItem, CartItemSchema } from '../cart.items/schemas/cart.items.schema';
import { MenuItemOption, MenuItemOptionSchema } from '../menu.item.options/schemas/menu.item.option.schema';
import { OrderDetail, OrderDetailSchema } from '../order.detail/schemas/order.detail.schema';
import { Shipper, ShipperSchema } from '../shippers/schemas/shipper.schema';
import { ShipperModule } from '../shippers/shipper.module';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: Order.name, schema: OrderSchema },
  { name: Restaurant.name, schema: RestaurantSchema },
  { name: User.name, schema: UserSchema },
  { name: Cart.name, schema: CartSchema },
  { name: CartItem.name, schema: CartItemSchema },
  { name: MenuItemOption.name, schema: MenuItemOptionSchema },
  { name: OrderDetail.name, schema: OrderDetailSchema },
  { name: Shipper.name, schema: ShipperSchema }, // Assuming Shipper schema is defined elsewhere


  
    ]),
    ShipperModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
