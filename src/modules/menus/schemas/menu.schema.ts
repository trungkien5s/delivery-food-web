// src/modules/menus/schemas/menu.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  image?: string;

}

export const MenuSchema = SchemaFactory.createForClass(Menu);