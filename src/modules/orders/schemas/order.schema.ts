import { Restaurant } from '@/modules/restaurants/schemas/restaurant.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Shipper } from '@/modules/shippers/schemas/shipper.schema'; 
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'PENDING', // Mới tạo, chưa có shipper
  ASSIGNED = 'ASSIGNED', // Đã gán shipper
  DELIVERING = 'DELIVERING', // Shipper đang giao
  DELIVERED = 'DELIVERED', // Giao thành công
  CANCELLED = 'CANCELLED', // Bị hủy
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name })
  restaurant: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING }) // ✅ Chuẩn hóa status
  status: OrderStatus;

  @Prop()
  totalPrice: number;

  @Prop({ default: () => new Date() })
  orderTime: Date;

  @Prop()
  deliveryTime: Date;

@Prop({ type: mongoose.Schema.Types.ObjectId, ref: Shipper.name, default: null })
shipper: mongoose.Types.ObjectId;

}

export const OrderSchema = SchemaFactory.createForClass(Order);
