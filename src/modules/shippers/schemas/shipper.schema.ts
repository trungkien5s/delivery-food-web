import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";


export type ShipperDocument = HydratedDocument<Shipper>;

@Schema({ timestamps: true })
export class Shipper {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Order' })
  currentOrders: mongoose.Types.ObjectId[];

  @Prop({default: 0})
  rating: number;

  @Prop({ default: false }) 
  isOnline: boolean; 
}
export const ShipperSchema = SchemaFactory.createForClass(Shipper);

