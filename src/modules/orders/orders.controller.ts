import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignShipperDto } from './dto/assign-shipper.dto';
import { OrderStatus } from './schemas/order.schema';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { RolesGuard } from '@/auth/passport/roles.guard';
import { Roles } from '@/decorator/roles.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new order from selected cart items' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created order from selected cart items',
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
    return this.ordersService.createFromCartItems(req.user._id, dto.cartItemIds, dto.orderTime);
  }

  @Post('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Create a new order from all cart items of a restaurant' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiBody({ 
    schema: {
      example: {
        orderTime: '2025-07-02T09:58:01.044Z'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created order from all cart items of the restaurant',
  })
  createFromRestaurantCart(
    @Req() req, 
    @Param('restaurantId') restaurantId: string,
    @Body() dto: { orderTime?: Date }
  ) {
    return this.ordersService.createFromCart(req.user._id, restaurantId, dto.orderTime);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiOkResponse({
    description: 'Successfully retrieved all orders',
    schema: {
      example: [
        {
          _id: '6874d59261b145d6c1382ad6',
          restaurant: {
            _id: '6874ce97bd90ae9587f79abc',
            name: 'Popeyes Fried Chicken',
            description: 'Hanoi specialty',
            phone: '0987654321',
            email: 'kienkk@gmail.com',
            address: '88 Nguy Nhu Kon Tum, Hanoi',
            image: 'https://example.com/image.jpg',
            rating: 0,
            isOpen: true,
            openTime: '07:00',
            closeTime: '22:00',
            createdAt: '2025-07-14T09:32:07.448Z',
            updatedAt: '2025-07-14T09:32:07.448Z',
            __v: 0
          },
          user: null,
          status: 'DELIVERED',
          totalPrice: 90000,
          orderTime: '2025-07-14T10:01:54.447Z',
          deliveryTime: '2025-07-14T10:46:54.447Z',
          shipper: '6874d4f561b145d6c1382ac3',
          createdAt: '2025-07-14T10:01:54.447Z',
          updatedAt: '2025-07-14T10:12:24.101Z',
          __v: 0
        }
      ]
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user\'s orders' })
  @ApiResponse({
    status: 200,
    description: 'List of orders created by the current user',
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID to update' })
  @ApiBody({ type: UpdateOrderDto })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID to delete' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign a shipper to an order' })
  @ApiParam({ name: 'id', description: 'Order ID to assign' })
  @ApiBody({ type: AssignShipperDto })
  assignOrderToShipper(
    @Param('id') orderId: string,
    @Body() dto: AssignShipperDto
  ) {
    return this.ordersService.assignShipper(orderId, dto.shipperId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Put(':id/shipper-status')
  @ApiOperation({ summary: 'Update order status by shipper' })
  @ApiParam({ name: 'id', description: 'Order ID to update' })
  @ApiBody({
    schema: {
      example: {
        status: 'DELIVERING',
        shipperId: '6874d4f561b145d6c1382ac3'
      }
    }
  })
  updateStatusByShipper(
    @Param('id') id: string,
    @Body() dto: { status: OrderStatus; shipperId: string }
  ) {
    return this.ordersService.updateStatusByShipper(id, dto.shipperId, dto.status);
  }
}