import { MenuItem } from '@/modules/menu.items/schemas/menu.item.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MenuItemOptionDocument = HydratedDocument<MenuItemOption>;

@Schema({ timestamps: true })
export class MenuItemOption {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: MenuItem.name, required: true })
  menuItem: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string; // Ví dụ: "Trân châu", "Ít đá", "Thêm trứng"

  @Prop({ default: 0 })
  priceAdjustment: number; // Giá tăng thêm khi chọn tuỳ chọn này
}

export const MenuItemOptionSchema = SchemaFactory.createForClass(MenuItemOption);
