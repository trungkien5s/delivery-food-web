import { MongooseModule } from "@nestjs/mongoose";
import { Shipper, ShipperSchema } from "./schemas/shipper.schema";
import { ShipperController } from "./shipper.controller";
import { ShipperService } from "./shipper.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [MongooseModule.forFeature([{ name: Shipper.name, schema: ShipperSchema }])],
  controllers: [ShipperController],
  providers: [ShipperService],
  exports: [ShipperService],
})
export class ShipperModule {}
