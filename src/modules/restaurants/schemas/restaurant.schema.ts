import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@Schema({ timestamps: true })
export class Restaurant {
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
  @Prop()
createdAt?: Date;

@Prop()
updatedAt?: Date;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
