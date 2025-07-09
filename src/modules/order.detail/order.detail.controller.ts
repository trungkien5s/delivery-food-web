import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderDetailDto } from './dto/create-order.detail.dto';
import { OrderDetailsService } from './order.detail.service';
import { UpdateOrderDetailDto } from './dto/update-order.detail.dto';

@ApiTags('OrderDetails')
@Controller('order-details')
export class OrderDetailsController {
  constructor(private readonly service: OrderDetailsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // controller
@Get('order/:orderId')
@ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo Order ID' })
findByOrder(@Param('orderId') orderId: string) {
  return this.service.findByOrder(orderId);
}
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

}
