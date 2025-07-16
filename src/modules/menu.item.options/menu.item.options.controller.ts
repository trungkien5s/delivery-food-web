import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MenuItemOptionsService } from './menu.item.options.service';
import { CreateMenuItemOptionDto } from './dto/create-menu.item.option.dto';
import { UpdateMenuItemOptionDto } from './dto/update-menu.item.option.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { RolesGuard } from '@/auth/passport/roles.guard';
import { Roles } from '@/decorator/roles.decorator';

@ApiTags('MenuItemOptions')
@Controller('menu-item-options')
export class MenuItemOptionsController {
  constructor(private readonly service: MenuItemOptionsService) {}

  @Post()
   @UseGuards(JwtAuthGuard,RolesGuard)
     @Roles('ADMIN')
      @ApiBearerAuth()
  create(@Body() dto: CreateMenuItemOptionDto) {
    return this.service.create(dto);
  }

   @UseGuards(JwtAuthGuard,RolesGuard)
   @Roles('ADMIN')
    @ApiBearerAuth()
  @Get()
  findAll() {
    return this.service.findAll();
  }

   @UseGuards(JwtAuthGuard,RolesGuard)
   @Roles('ADMIN')
    @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }


   @UseGuards(JwtAuthGuard,RolesGuard)
   @Roles('ADMIN')
    @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemOptionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
