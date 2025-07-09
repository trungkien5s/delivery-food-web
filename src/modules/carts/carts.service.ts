import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart, CartDocument } from './schemas/carts.schema';

@Injectable()
export class CartsService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  create(dto: CreateCartDto) {
    return this.cartModel.create(dto);
  }

  findByUser(userId: string) {
    return this.cartModel.findOne({ user: userId });
  }

  update(userId: string, dto: UpdateCartDto) {
    return this.cartModel.findOneAndUpdate({ user: userId }, dto, { new: true });
  }

  remove(userId: string) {
    return this.cartModel.findOneAndDelete({ user: userId });
  }
}
