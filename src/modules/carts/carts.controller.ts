import { Controller, Get, Post, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

   @UseGuards(JwtAuthGuard)
      @ApiBearerAuth()
@Post('me')
create(@Req() req: any, @Body() dto: CreateCartDto) {
  return this.cartsService.create({
    ...dto,
    user: req.user._id, // lấy từ JWT middleware
  });
}


 @UseGuards(JwtAuthGuard)

    @ApiBearerAuth()
  @Get('me')
  findMe(@Req() req: any) {
    return this.cartsService.findByUser(req.user._id);
  }

   @UseGuards(JwtAuthGuard)
      @ApiBearerAuth()
  @Delete('me')
  remove(@Req() req: any) {
    return this.cartsService.remove(req.user._id);
  }
}
