import { Cart } from "@/modules/carts/schemas/carts.schema";
import { MenuItemOption } from "@/modules/menu.item.options/schemas/menu.item.option.schema";
import { MenuItem } from "@/modules/menu.items/schemas/menu.item.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type CartItemDocument = HydratedDocument<CartItem>;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true })
  cart: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true })
  menuItem: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  quantity: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItemOption' }] })
  selectedOptions: mongoose.Types.ObjectId[];
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
