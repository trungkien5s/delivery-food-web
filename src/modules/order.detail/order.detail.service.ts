import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDetail, OrderDetailDocument } from './schemas/order.detail.schema';
import { CreateOrderDetailDto } from './dto/create-order.detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order.detail.dto';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectModel(OrderDetail.name)
    private readonly model: Model<OrderDetailDocument>,
  ) {}



  findAll() {
    return this.model.find().populate(['order', 'menuItem', 'selectedOptions']);
  }
  // service
async findByOrder(orderId: string) {
  return this.model.find({ order: orderId }).populate(['menuItem', 'selectedOptions']);
}


  findOne(id: string) {
    return this.model.findById(id).populate(['order', 'menuItem', 'selectedOptions']);
  }

}
