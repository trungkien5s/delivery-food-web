import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true })
  name: string; // VD: 'Cơm', 'Trà sữa'

  @Prop()
  iconUrl?: string;

  @Prop()
  slug?: string; // VD: 'com', 'tra-sua'
}

export const CategorySchema = SchemaFactory.createForClass(Category);
