// categories/schemas/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ trim: true, lowercase: true })
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Virtual: tất cả MenuItem có category = _id này
CategorySchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'categoryId',
  justOne: false,
});
