import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderDetailDto } from './dto/create-order.detail.dto';
import { OrderDetailsService } from './order.detail.service';
import { UpdateOrderDetailDto } from './dto/update-order.detail.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { Roles } from '@/decorator/roles.decorator';
import { RolesGuard } from '@/auth/passport/roles.guard';

@ApiTags('OrderDetails')
@Controller('order-details')
export class OrderDetailsController {
  constructor(private readonly service: OrderDetailsService) {}

   @UseGuards(JwtAuthGuard,RolesGuard)
     @Roles('ADMIN')
      @ApiBearerAuth()
  @Get()
  findAll() {
    return this.service.findAll();
  }

 @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
@Get('order/:orderId')
@ApiOperation({ summary: 'Get order by ID' })
findByOrder(@Param('orderId') orderId: string) {
  return this.service.findByOrder(orderId);
}


}
