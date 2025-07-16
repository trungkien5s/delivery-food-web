import {
  Controller, Get, Post, Body, Put, Param, Delete,
  UseInterceptors, UploadedFile, UseGuards,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { RolesGuard } from '@/auth/passport/roles.guard';
import { Roles } from '@/decorator/roles.decorator';

@ApiTags('Menus')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new menu for a restaurant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        restaurant: {
          type: 'string',
          example: '60f71ad23e1d3f001e2d3c5a',
          description: 'Restaurant ID to which this menu belongs',
        },
        title: {
          type: 'string',
          example: 'Fried Chicken Combo',
          description: 'Title of the menu',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Menu image (upload file)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  create(
    @Body() createMenuDto: CreateMenuDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.menusService.create(createMenuDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menus' })
  @ApiResponse({ status: 200, description: 'List of all menus' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu details by ID' })
  @ApiParam({ name: 'id', description: 'ID of the menu to retrieve' })
  @ApiResponse({ status: 200, description: 'Menu details retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu by ID' })
  @ApiParam({ name: 'id', description: 'ID of the menu to update' })
  @ApiBody({ type: UpdateMenuDto })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu by ID' })
  @ApiParam({ name: 'id', description: 'ID of the menu to delete' })
  @ApiResponse({
    status: 200,
    description: 'Menu deleted successfully',
    schema: {
      example: {
        message: 'Menu deleted successfully',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
