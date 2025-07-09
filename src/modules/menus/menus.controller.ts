import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo menu mới cho nhà hàng' })
  @ApiBody({ type: CreateMenuDto })
  @ApiResponse({ status: 201, description: 'Tạo menu thành công' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả menu' })
  @ApiResponse({ status: 200, description: 'Danh sách menu' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết menu theo ID' })
  @ApiParam({ name: 'id', description: 'ID menu cần lấy' })
  @ApiResponse({ status: 200, description: 'Chi tiết menu' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật menu theo ID' })
  @ApiParam({ name: 'id', description: 'ID menu cần cập nhật' })
  @ApiBody({ type: UpdateMenuDto })
  @ApiResponse({ status: 200, description: 'Menu sau khi cập nhật' })
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá menu theo ID' })
  @ApiParam({ name: 'id', description: 'ID menu cần xoá' })
  @ApiResponse({
    status: 200,
    description: 'Thông báo xoá thành công',
    schema: {
      example: {
        message: 'Xoá menu thành công',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
