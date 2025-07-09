import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { MenuItemOptionsService } from './menu.item.options.service';
import { CreateMenuItemOptionDto } from './dto/create-menu.item.option.dto';
import { UpdateMenuItemOptionDto } from './dto/update-menu.item.option.dto';

@ApiTags('MenuItemOptions')
@Controller('menu-item-options')
export class MenuItemOptionsController {
  constructor(private readonly service: MenuItemOptionsService) {}

  @Post()
  create(@Body() dto: CreateMenuItemOptionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemOptionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
