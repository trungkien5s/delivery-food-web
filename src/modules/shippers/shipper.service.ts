import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Shipper, ShipperDocument } from "./schemas/shipper.schema";
import { CreateShipperDto } from "./dto/create-shipper.dto";
import { Model } from "mongoose";
import { UpdateShipperDto } from "./dto/update-shipper.dto";

@Injectable()
export class ShipperService {
  constructor(@InjectModel(Shipper.name) private model: Model<ShipperDocument>) {}


async create(dto: CreateShipperDto) {
  const existing = await this.model.findOne({ phone: dto.phone });

  if (existing) {
    throw new HttpException('Số điện thoại đã được sử dụng bởi một shipper khác.', HttpStatus.BAD_REQUEST);
  }

  return this.model.create(dto);
}


  findAll() {
    return this.model.find().exec();
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  update(id: string, dto: UpdateShipperDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true });
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  setStatus(id: string, status: 'available' | 'delivering' | 'offline') {
    return this.model.findByIdAndUpdate(id, { status }, { new: true });
  }
}
