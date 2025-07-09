import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo nhà hàng mới' })
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({ status: 201, description: 'Nhà hàng đã được tạo' })
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhà hàng' })
  @ApiResponse({ status: 200, description: 'Danh sách nhà hàng' })
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết nhà hàng theo ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Thông tin nhà hàng' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật nhà hàng theo ID' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  update(@Param('id') id: string, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá nhà hàng theo ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Xoá thành công' })
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }
}
