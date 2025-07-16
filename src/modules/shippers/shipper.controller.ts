import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ShipperService } from "./shipper.service";
import { CreateShipperDto } from "./dto/create-shipper.dto";
import { UpdateShipperDto } from "./dto/update-shipper.dto";
import { JwtAuthGuard } from "@/auth/passport/jwt-auth.guard";
import { RolesGuard } from "@/auth/passport/roles.guard";
import { Roles } from "@/decorator/roles.decorator";

@ApiTags('Shipper')
@Controller('shippers')
export class ShipperController {
  constructor(private readonly service: ShipperService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  create(@Body() dto: CreateShipperDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateShipperDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

@Put(':id/online')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
async updateOnlineStatus(
  @Param('id') id: string,
  @Body() body: { online: boolean }
) {
  return this.service.setOnlineStatus(id, body.online);
}

  
}
