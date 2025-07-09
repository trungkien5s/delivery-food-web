import { Controller, Get, Post, Body, Param, Delete, Put, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('')
  @ApiOperation({ summary: 'Tạo đơn hàng từ giỏ hàng của người dùng hiện tại' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo đơn hàng từ giỏ thành công',
    schema: {
      example: {
        _id: '64e3c4ba1f9b8b001a0c1234',
        restaurant: '64e3c4ba1f9b8b001a0c5678',
        user: '64e3c4ba1f9b8b001a0c9999',
        status: 'PENDING',
        totalPrice: 150000,
        orderTime: '2025-07-02T09:58:01.044Z',
        deliveryTime: '2025-07-02T10:30:00.000Z',
      }
    }
  })
  createFromCart(@Req() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromCart(req.user._id, dto.orderTime);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đơn hàng' })
  findAll() {
    return this.ordersService.findAll();
  }
  @Get('me')
@ApiOperation({ summary: 'Lấy danh sách đơn hàng của người dùng hiện tại' })
@ApiResponse({
  status: 200,
  description: 'Danh sách đơn hàng của tôi',
  schema: {
    example: [
      {
        _id: '64e3c4ba1f9b8b001a0c1234',
        restaurant: '64e3c4ba1f9b8b001a0c5678',
        user: '64e3c4ba1f9b8b001a0c9999',
        status: 'PENDING',
        totalPrice: 150000,
        orderTime: '2025-07-02T09:58:01.044Z',
        deliveryTime: '2025-07-02T10:30:00.000Z',
      }
    ]
  }
})
findMyOrders(@Req() req) {
  return this.ordersService.findByUser(req.user._id);
}

  

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn hàng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng cần cập nhật' })
  @ApiBody({ type: UpdateOrderDto })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá đơn hàng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng cần xoá' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
