// src/modules/orders/orders.service.ts
import { BadRequestException, Body, ForbiddenException, Injectable, NotFoundException, Param, Put, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Restaurant, RestaurantDocument } from '../restaurants/schemas/restaurant.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Cart } from '../carts/schemas/carts.schema';
import { CartItem } from '../cart.items/schemas/cart.items.schema';
import { MenuItem } from '../menu.items/schemas/menu.item.schema';
import { MenuItemOption } from '../menu.item.options/schemas/menu.item.option.schema';
import { OrderDetail } from '../order.detail/schemas/order.detail.schema';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Shipper, ShipperDocument } from '../shippers/schemas/shipper.schema';
import { ShipperService } from '../shippers/shipper.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(MenuItemOption.name) private menuItemOptionModel: Model<MenuItemOption>,
    @InjectModel(OrderDetail.name) private orderDetailModel: Model<OrderDetail>,
    @InjectModel(Shipper.name) private shipperModel: Model<ShipperDocument>,
      private readonly shipperService: ShipperService, // ✅ inject




  ) {}
async createFromCart(userId: string, restaurantId: string, orderTime?: Date) {
  const cart = await this.cartModel.findOne({ user: userId });
  if (!cart) throw new NotFoundException('Không tìm thấy giỏ hàng');

  const cartItems = await this.cartItemModel
    .find({ cart: cart._id })
    .populate({
      path: 'menuItem',
      populate: {
        path: 'menu',
        populate: { path: 'restaurant' },
      },
    })
    .populate({
      path: 'selectedOptions',
      select: 'priceAdjustment',
    });

  if (cartItems.length === 0) {
    throw new NotFoundException('Giỏ hàng trống');
  }

  // ✅ Lọc ra các món thuộc nhà hàng được chọn
  const items = cartItems.filter(item => {
    const rId = (item.menuItem as any)?.menu?.restaurant?._id?.toString();
    return rId === restaurantId;
  });

  if (items.length === 0) {
    throw new BadRequestException('Không có món nào thuộc nhà hàng đã chọn');
  }

  // ✅ Gom món giống nhau
  const itemMap = new Map<string, { menuItem: any; quantity: number; selectedOptions: any[] }>();
  for (const item of items) {
    const menuItemId = (item.menuItem as any)._id.toString();
    const selectedOptionIds = (item.selectedOptions || []).map(opt => opt._id.toString()).sort();
    const key = `${menuItemId}::${selectedOptionIds.join(',')}`;

    if (!itemMap.has(key)) {
      itemMap.set(key, {
        menuItem: item.menuItem,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || [],
      });
    } else {
      const existing = itemMap.get(key)!;
      existing.quantity += item.quantity;
    }
  }

  //  Tính tổng giá
  let totalPrice = 0;
  for (const { menuItem, quantity, selectedOptions } of itemMap.values()) {
    const optionExtra = selectedOptions.reduce((sum, opt: any) => sum + (opt.priceAdjustment || 0), 0);
    const itemPrice = (menuItem.basePrice + optionExtra) * quantity;
    totalPrice += itemPrice;
  }

  const now = orderTime || new Date();
  const deliveryTime = new Date(now.getTime() + 45 * 60 * 1000);

  // Tạo đơn hàng
  const order = await this.orderModel.create({
    user: userId,
    restaurant: restaurantId,
    totalPrice,
    status: 'PENDING',
    orderTime: now,
    deliveryTime,
  });

  //  Tạo orderDetail
  for (const { menuItem, quantity, selectedOptions } of itemMap.values()) {
    const optionExtra = selectedOptions.reduce((sum, opt: any) => sum + (opt.priceAdjustment || 0), 0);
    const price = (menuItem.basePrice + optionExtra) * quantity;

    await this.orderDetailModel.create({
      order: order._id,
      menuItem: menuItem._id,
      quantity,
      selectedOptions: selectedOptions.map(opt => opt._id),
      price,
    });
  }

  //  Xoá các món thuộc nhà hàng vừa đặt
  await this.cartItemModel.deleteMany({
    cart: cart._id,
    menuItem: { $in: items.map(i => (i.menuItem as any)._id) },
  });

  return this.orderModel.findById(order._id)
  .populate('user')
  .populate('restaurant');

}





// orders.service.ts
async updateStatus(orderId: string, status: OrderStatus) {
  if (!isValidObjectId(orderId)) throw new NotFoundException('ID không hợp lệ');

  const order = await this.orderModel.findById(orderId);
  if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

 
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
    [OrderStatus.ASSIGNED]: [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  const current = order.status;
  if (!validTransitions[current].includes(status)) {
    throw new Error(`Không thể chuyển từ ${current} sang ${status}`);
  }

  order.status = status;
  await order.save();

  return order;
}


async findByUser(userId: string) {
  return this.orderModel
    .find({ user: userId })
    .populate('restaurant')
    .populate('user')
    .sort({ orderTime: -1 }); 
}

  async findAll() {
    return this.orderModel.find().populate('restaurant').populate('user');
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const order = await this.orderModel.findById(id).populate('restaurant').populate('user');
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const updated = await this.orderModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Không tìm thấy đơn hàng để cập nhật');
    return updated;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('ID không hợp lệ');
    const deleted = await this.orderModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Không tìm thấy đơn hàng để xoá');
    return { message: 'Xoá đơn hàng thành công' };
  }
  async assignShipper(orderId: string, shipperId: string) {
  // Kiểm tra ID
  if (!isValidObjectId(orderId) || !isValidObjectId(shipperId)) {
    throw new NotFoundException('ID không hợp lệ');
  }

  const order = await this.orderModel.findById(orderId);
  if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

  if (order.status !== OrderStatus.PENDING) {
    throw new Error(`Đơn hàng không ở trạng thái có thể nhận (hiện tại: ${order.status})`);
  }

  // Có thể kiểm tra shipper tồn tại (nếu cần)
  const shipper = await this.shipperModel.findById(shipperId);
  if (!shipper) throw new NotFoundException('Shipper không tồn tại');

    if (!shipper.isOnline) {
    throw new ForbiddenException('Shipper hiện đang offline, không thể gán đơn hàng');
  }

  // Gán shipper và cập nhật trạng thái
order.shipper = new Types.ObjectId(shipperId);  
order.status = OrderStatus.ASSIGNED;
  await order.save();

  await this.shipperService.addOrderToShipper(shipperId, order._id.toString());

  return order;

}
  // orders.service.ts
async updateStatusByShipper(
  orderId: string,
  shipperId: string,
  newStatus: OrderStatus,
) {

  if (!isValidObjectId(orderId) || !isValidObjectId(shipperId)) {
    throw new NotFoundException('ID không hợp lệ');
  }


  const order = await this.orderModel.findById(orderId);
  if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');


  if (!order.shipper) {
    throw new ForbiddenException('Đơn hàng chưa có shipper');
  }

  if (order.shipper.toString() !== shipperId.toString()) {
    throw new ForbiddenException('Bạn không phải shipper của đơn hàng này');
  }


  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [],
    ASSIGNED: [OrderStatus.DELIVERING],
    DELIVERING: [OrderStatus.DELIVERED],
    DELIVERED: [],
    CANCELLED: [],
  };

  const allowedNext = validTransitions[order.status] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new ForbiddenException(
      `Không thể chuyển từ ${order.status} sang ${newStatus}`,
    );
  }

  
  order.status = newStatus;
  await order.save();

  // ✅ Nếu giao hàng thành công → xoá khỏi shipper.currentOrders
  if (newStatus === OrderStatus.DELIVERED) {
    await this.shipperService.removeOrderFromShipper(shipperId, order._id.toString());
  }

  return order;
}





}

