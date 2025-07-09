import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RestaurantSchemaClass {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop()
  image: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: true })
  isOpen: boolean;

  @Prop()
  openTime: string;

  @Prop()
  closeTime: string;
}

export type RestaurantDocument = RestaurantSchemaClass & Document;
export const RestaurantSchema = SchemaFactory.createForClass(RestaurantSchemaClass);