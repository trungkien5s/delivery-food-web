import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CreateCartItemDto, CreateCartItemsDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartItemsService } from './cart.items.service';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@ApiTags('cart_items')
@Controller('cart_items')
export class CartItemsController {
  constructor(private readonly service: CartItemsService) {}


   @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
  @Get('me')
  findAll(@Req() req: any) {
    return this.service.findAllByUser(req.user._id);
  }

   @UseGuards(JwtAuthGuard)
      @ApiBearerAuth()
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


   @UseGuards(JwtAuthGuard)
      @ApiBearerAuth()
  @Put('me/:item_id')
  update(@Param('item_id') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.service.update(itemId, dto);
  }


   @UseGuards(JwtAuthGuard)
      @ApiBearerAuth()
  @Delete('me/:item_id')
  remove(@Param('item_id') itemId: string) {
    return this.service.remove(itemId);
  }
}
