import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Order } from '@/modules/orders/schemas/order.schema';
import { MenuItem } from '@/modules/menu.items/schemas/menu.item.schema';
import { MenuItemOption } from '@/modules/menu.item.options/schemas/menu.item.option.schema';

export type OrderDetailDocument = HydratedDocument<OrderDetail>;

@Schema({ timestamps: true })
export class OrderDetail {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Order.name, required: true })
  order: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: MenuItem.name, required: true })
  menuItem: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  quantity: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: MenuItemOption.name, default: [] })
  selectedOptions: mongoose.Types.ObjectId[];

  @Prop({ type: Number })
  price: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
