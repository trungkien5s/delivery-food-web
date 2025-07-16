import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMenuItemDto } from './dto/create-menu.item.dto';
import { UpdateMenuItemDto } from './dto/update-menu.item.dto';
import { MenuItemsService } from './menu.items.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { RolesGuard } from '@/auth/passport/roles.guard';
import { Roles } from '@/decorator/roles.decorator';

@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly service: MenuItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        menu: { type: 'string', example: 'menuId' },
        restaurant: { type: 'string', example: 'restaurantId' },
        categoryId: { type: 'string', example: 'categoryId', nullable: true },
        title: { type: 'string', example: 'Bún bò Huế' },
        description: { type: 'string', example: 'Hue specialty noodle soup' },
        basePrice: { type: 'number', example: 45000 },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  create(@Body() dto: CreateMenuItemDto, @UploadedFile() file: Express.Multer.File) {
    return this.service.create(dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiOperation({ summary: 'Get menu item details by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update menu item' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

