import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ShipperService } from "./shipper.service";
import { CreateShipperDto } from "./dto/create-shipper.dto";
import { UpdateShipperDto } from "./dto/update-shipper.dto";

@ApiTags('Shipper')
@Controller('shippers')
export class ShipperController {
  constructor(private readonly service: ShipperService) {}

  @Post()
  create(@Body() dto: CreateShipperDto) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShipperDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'available' | 'delivering' | 'offline',
  ) {
    return this.service.setStatus(id, status);
  }
}
