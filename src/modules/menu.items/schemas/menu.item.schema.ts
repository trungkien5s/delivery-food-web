import { Menu } from '@/modules/menus/schemas/menu.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Menu.name, required: true })
  menu: mongoose.Schema.Types.ObjectId;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop()
  image: string;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
