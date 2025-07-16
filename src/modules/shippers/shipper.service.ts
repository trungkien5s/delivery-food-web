import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Shipper, ShipperDocument } from "./schemas/shipper.schema";
import { CreateShipperDto } from "./dto/create-shipper.dto";
import { Model, isValidObjectId } from "mongoose";
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

async setOnlineStatus(id: string, online: boolean) {
  return this.model.findByIdAndUpdate(id, { isOnline: online }, { new: true });
}


  /**
   * ✅ Khi nhận đơn hàng → thêm vào currentOrders[]
   */
  async addOrderToShipper(shipperId: string, orderId: string) {
    if (!isValidObjectId(shipperId) || !isValidObjectId(orderId)) {
      throw new NotFoundException('ID không hợp lệ');
    }

    return this.model.findByIdAndUpdate(
      shipperId,
      { $addToSet: { currentOrders: orderId } },
      { new: true }
    );
  }

  /**
   * ✅ Khi giao xong → xoá khỏi currentOrders[]
   */
  async removeOrderFromShipper(shipperId: string, orderId: string) {
    if (!isValidObjectId(shipperId) || !isValidObjectId(orderId)) {
      throw new NotFoundException('ID không hợp lệ');
    }

    return this.model.findByIdAndUpdate(
      shipperId,
      { $pull: { currentOrders: orderId } },
      { new: true }
    );
  }
}
