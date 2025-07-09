import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateMenuItemDto } from './dto/create-menu.item.dto';
import { UpdateMenuItemDto } from './dto/update-menu.item.dto';
import { MenuItemsService } from './menu.items.service';

@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly service: MenuItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo món ăn mới' })
  @ApiBody({ type: CreateMenuItemDto })
  create(@Body() dto: CreateMenuItemDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả menu items' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Chi tiết món ăn' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật món ăn' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá món ăn' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
