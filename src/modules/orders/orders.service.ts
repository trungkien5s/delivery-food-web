// src/modules/orders/orders.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

interface PopulatedMenuItemDocument extends Omit<MenuItem, 'menu'> {
  _id: Types.ObjectId;
  menu: {
    restaurant: Restaurant & { _id: Types.ObjectId };
  };
  basePrice: number;
}

interface PopulatedMenuItemOptionDocument extends MenuItemOption {
  _id: Types.ObjectId;
  priceAdjustment: number;
}

interface PopulatedCartItemDocument extends Omit<CartItem, 'menuItem' | 'selectedOptions'> {
  _id: Types.ObjectId;
  menuItem: PopulatedMenuItemDocument;
  selectedOptions: PopulatedMenuItemOptionDocument[];
  quantity: number;
}

interface GroupedCartItem {
  menuItem: PopulatedMenuItemDocument;
  quantity: number;
  selectedOptions: PopulatedMenuItemOptionDocument[];
}

interface ValidTransitions {
  [key: string]: OrderStatus[];
}

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
    private readonly shipperService: ShipperService,
  ) {}

  // Phương thức tạo đơn hàng từ CartItem cụ thể
  async createFromCartItems(userId: string, cartItemIds: string[], orderTime?: Date): Promise<OrderDocument> {
    // Validate cartItemIds
    if (!cartItemIds || cartItemIds.length === 0) {
      throw new BadRequestException('Danh sách CartItem không được rỗng');
    }

    // Validate ObjectIds
    for (const id of cartItemIds) {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`CartItem ID không hợp lệ: ${id}`);
      }
    }

    // Lấy cart của user
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    // Lấy các CartItem được chọn
    const cartItems = await this.cartItemModel
      .find({ 
        _id: { $in: cartItemIds },
        cart: cart._id // Đảm bảo CartItem thuộc về cart của user
      })
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
      }) as unknown as PopulatedCartItemDocument[];

    if (cartItems.length === 0) {
      throw new NotFoundException('Không tìm thấy CartItem nào phù hợp');
    }

    if (cartItems.length !== cartItemIds.length) {
      throw new BadRequestException('Một số CartItem không tồn tại hoặc không thuộc về giỏ hàng của bạn');
    }

    // Kiểm tra tất cả CartItem phải cùng nhà hàng
    const restaurantIds = [...new Set(cartItems.map(item => 
      item.menuItem?.menu?.restaurant?._id?.toString()
    ))];

    if (restaurantIds.length !== 1 || !restaurantIds[0]) {
      throw new BadRequestException('Tất cả món phải thuộc cùng một nhà hàng');
    }

    const restaurantId = restaurantIds[0];

    // Gom món giống nhau (cùng menuItem và cùng selectedOptions)
    const itemMap = new Map<string, GroupedCartItem>();
    
    for (const item of cartItems) {
      const menuItemId = item.menuItem._id.toString();
      const selectedOptionIds = item.selectedOptions
        .map(opt => opt._id.toString())
        .sort();
      const key = `${menuItemId}::${selectedOptionIds.join(',')}`;

      if (!itemMap.has(key)) {
        itemMap.set(key, {
          menuItem: item.menuItem,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
        });
      } else {
        const existing = itemMap.get(key)!;
        existing.quantity += item.quantity;
      }
    }

    // Tính tổng giá
    let totalPrice = 0;
    for (const { menuItem, quantity, selectedOptions } of itemMap.values()) {
      const optionExtra = selectedOptions.reduce(
        (sum, opt) => sum + (opt.priceAdjustment || 0),
        0
      );
      const itemPrice = (menuItem.basePrice + optionExtra) * quantity;
      totalPrice += itemPrice;
    }

    const now = orderTime || new Date();
    const deliveryTime = new Date(now.getTime() + 45 * 60 * 1000); // 45 phút sau

    // Tạo đơn hàng
    const order = await this.orderModel.create({
      user: userId,
      restaurant: restaurantId,
      totalPrice,
      status: OrderStatus.PENDING,
      orderTime: now,
      deliveryTime,
    });

    // Tạo orderDetail cho từng nhóm món
    for (const { menuItem, quantity, selectedOptions } of itemMap.values()) {
      const optionExtra = selectedOptions.reduce(
        (sum, opt) => sum + (opt.priceAdjustment || 0),
        0
      );
      const price = (menuItem.basePrice + optionExtra) * quantity;

      await this.orderDetailModel.create({
        order: order._id,
        menuItem: menuItem._id,
        quantity,
        selectedOptions: selectedOptions.map(opt => opt._id),
        price,
      });
    }

    // Xóa các CartItem đã đặt hàng khỏi giỏ hàng
    await this.cartItemModel.deleteMany({
      _id: { $in: cartItemIds }
    });

    // Trả về order đã populate
    const populatedOrder = await this.orderModel
      .findById(order._id)
      .populate('user')
      .populate('restaurant');

    if (!populatedOrder) {
      throw new NotFoundException('Không thể tìm thấy đơn hàng vừa tạo');
    }

    return populatedOrder;
  }

  // Phương thức tạo đơn hàng từ toàn bộ cart của một nhà hàng (giữ lại để backward compatibility)
  async createFromCart(userId: string, restaurantId: string, orderTime?: Date): Promise<OrderDocument> {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

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
      }) as unknown as PopulatedCartItemDocument[];

    if (cartItems.length === 0) {
      throw new NotFoundException('Giỏ hàng trống');
    }

    // Lọc ra các món thuộc nhà hàng được chọn
    const items = cartItems.filter(item => {
      const restaurantObjectId = item.menuItem?.menu?.restaurant?._id;
      return restaurantObjectId?.toString() === restaurantId;
    });

    if (items.length === 0) {
      throw new BadRequestException('Không có món nào thuộc nhà hàng đã chọn');
    }

    // Sử dụng lại logic tương tự như createFromCartItems
    const cartItemIds = items.map(item => item._id.toString());
    return this.createFromCartItems(userId, cartItemIds, orderTime);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderDocument> {
    if (!isValidObjectId(orderId)) {
      throw new NotFoundException('ID không hợp lệ');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const validTransitions: ValidTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
      [OrderStatus.ASSIGNED]: [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const currentStatus = order.status;
    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(status)) {
      throw new BadRequestException(`Không thể chuyển từ ${currentStatus} sang ${status}`);
    }

    order.status = status;
    await order.save();

    return order;
  }

  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ user: userId })
      .populate('restaurant')
      .populate('user')
      .sort({ orderTime: -1 });
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel
      .find()
      .populate('restaurant')
      .populate('user');
  }

  async findOne(id: string): Promise<OrderDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('ID không hợp lệ');
    }
    
    const order = await this.orderModel
      .findById(id)
      .populate('restaurant')
      .populate('user');
      
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('ID không hợp lệ');
    }
    
    const updated = await this.orderModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) {
      throw new NotFoundException('Không tìm thấy đơn hàng để cập nhật');
    }
    
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('ID không hợp lệ');
    }
    
    const deleted = await this.orderModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy đơn hàng để xoá');
    }
    
    return { message: 'Xoá đơn hàng thành công' };
  }

  async assignShipper(orderId: string, shipperId: string): Promise<OrderDocument> {
    // Kiểm tra ID
    if (!isValidObjectId(orderId) || !isValidObjectId(shipperId)) {
      throw new NotFoundException('ID không hợp lệ');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Đơn hàng không ở trạng thái có thể nhận (hiện tại: ${order.status})`);
    }

    // Kiểm tra shipper tồn tại
    const shipper = await this.shipperModel.findById(shipperId);
    if (!shipper) {
      throw new NotFoundException('Shipper không tồn tại');
    }

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

  async updateStatusByShipper(
    orderId: string,
    shipperId: string,
    newStatus: OrderStatus,
  ): Promise<OrderDocument> {
    if (!isValidObjectId(orderId) || !isValidObjectId(shipperId)) {
      throw new NotFoundException('ID không hợp lệ');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (!order.shipper) {
      throw new ForbiddenException('Đơn hàng chưa có shipper');
    }

    if (order.shipper.toString() !== shipperId.toString()) {
      throw new ForbiddenException('Bạn không phải shipper của đơn hàng này');
    }

    const validTransitions: ValidTransitions = {
      [OrderStatus.PENDING]: [],
      [OrderStatus.ASSIGNED]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowedNext = validTransitions[order.status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new ForbiddenException(
        `Không thể chuyển từ ${order.status} sang ${newStatus}`,
      );
    }

    order.status = newStatus;
    await order.save();

    // Nếu giao hàng thành công → xoá khỏi shipper.currentOrders
    if (newStatus === OrderStatus.DELIVERED) {
      await this.shipperService.removeOrderFromShipper(shipperId, order._id.toString());
    }

    return order;
  }
}