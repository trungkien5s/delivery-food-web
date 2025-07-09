import { Controller, Get, Post, Body, Put, Param, Delete, Req } from '@nestjs/common';
import { CreateCartItemDto, CreateCartItemsDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiTags } from '@nestjs/swagger';
import { CartItemsService } from './cart.items.service';

@ApiTags('cart_items')
@Controller('cart_items')
export class CartItemsController {
  constructor(private readonly service: CartItemsService) {}

  @Get('me')
  findAll(@Req() req: any) {
    return this.service.findAllByUser(req.user._id);
  }

  @Post('me')
  async create(@Req() req: any, @Body() dto: CreateCartItemsDto) {
    const userId = req.user._id;
    const results = [];
    for (const item of dto.items) {
      const created = await this.service.create(userId, item);
      results.push(created);
    }
    return results;
  }

  @Put('me/:item_id')
  update(@Param('item_id') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.service.update(itemId, dto);
  }

  @Delete('me/:item_id')
  remove(@Param('item_id') itemId: string) {
    return this.service.remove(itemId);
  }
}
