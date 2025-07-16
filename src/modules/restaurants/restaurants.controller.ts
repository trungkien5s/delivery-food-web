import {
  Controller, Get, Post, Body, Put, Param, Delete, UploadedFile, UseInterceptors,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes,
  ApiBearerAuth
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { RolesGuard } from '@/auth/passport/roles.guard';
import { Roles } from '@/decorator/roles.decorator';


@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Pho Thin' },
        description: { type: 'string', example: 'Famous Pho restaurant' },
        phone: { type: 'string', example: '0901234567' },
        email: { type: 'string', example: 'pho@restaurant.com' },
        address: { type: 'string', example: '123 Ly Thuong Kiet' },
        rating: { type: 'number', example: 4.5 },
        isOpen: { type: 'boolean', example: true },
        openTime: { type: 'string', example: '08:00' },
        closeTime: { type: 'string', example: '22:00' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  create(
    @Body() dto: CreateRestaurantDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.restaurantsService.create(dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all restaurants' })
  @ApiResponse({ status: 200, description: 'List of restaurants retrieved successfully' })
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant details by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant details retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiOperation({ summary: 'Update a restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.restaurantsService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant deleted successfully' })
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }
}

