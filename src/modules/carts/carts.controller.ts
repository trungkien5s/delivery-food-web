import { Controller, Get, Post, Delete, Body, Req } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

@Post('me')
create(@Req() req: any, @Body() dto: CreateCartDto) {
  return this.cartsService.create({
    ...dto,
    user: req.user._id, // lấy từ JWT middleware
  });
}


  @Get('me')
  findMe(@Req() req: any) {
    return this.cartsService.findByUser(req.user._id);
  }

  @Delete('me')
  remove(@Req() req: any) {
    return this.cartsService.remove(req.user._id);
  }
}
