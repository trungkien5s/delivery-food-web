import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import mongoose, { HydratedDocument } from 'mongoose';
import { Restaurant } from '@/modules/restaurants/schemas/restaurant.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true, unique: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }])
  items: mongoose.Types.ObjectId[]; 
}



export const CartSchema = SchemaFactory.createForClass(Cart);
