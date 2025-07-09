// src/modules/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Restaurant, RestaurantDocument } from '../restaurants/schemas/restaurant.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Cart } from '../carts/schemas/carts.schema';
import { CartItem } from '../cart.items/schemas/cart.items.schema';
import { MenuItem } from '../menu.items/schemas/menu.item.schema';
import { MenuItemOption } from '../menu.item.options/schemas/menu.item.option.schema';
import { OrderDetail } from '../order.detail/schemas/order.detail.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(MenuItemOption.name) private menuItemOptionModel: Model<MenuItemOption>,
    @InjectModel(OrderDetail.name) private orderDetailModel: Model<OrderDetail>,


  ) {}

async createFromCart(userId: string, orderTime?: Date) {
  const cart = await this.cartModel.findOne({ user: userId });
  if (!cart) throw new NotFoundException('Không tìm thấy giỏ hàng');

  const cartItems = await this.cartItemModel
    .find({ cart: cart._id })
    .populate({
      path: 'menuItem',
      select: 'basePrice title',
    })
    .populate({
      path: 'selectedOptions',
      select: 'priceAdjustment',
    });

  if (cartItems.length === 0) {
    throw new NotFoundException('Giỏ hàng trống');
  }

  // ✅ Gộp các món giống nhau (menuItem + selectedOptions)
  const itemMap = new Map<string, { menuItem: any; quantity: number; selectedOptions: any[] }>();
  for (const item of cartItems) {
    let menuItemId: string;
    if (item.menuItem && typeof item.menuItem === 'object' && '_id' in item.menuItem) {
      menuItemId = (item.menuItem as any)._id.toString();
    } else {
      menuItemId = item.menuItem?.toString();
    }
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

  // ✅ Tính tổng giá
  let totalPrice = 0;
  for (const { menuItem, quantity, selectedOptions } of itemMap.values()) {
    const optionExtra = selectedOptions.reduce((sum, opt: any) => sum + (opt.priceAdjustment || 0), 0);
    const itemPrice = (menuItem.basePrice + optionExtra) * quantity;
    totalPrice += itemPrice;
  }

  // ✅ Lấy restaurant từ một menuItem (giả định giỏ chỉ chứa 1 nhà hàng)
  const firstMenuItem = cartItems[0].menuItem as any;
  const restaurant = cart.restaurant;
  if (!restaurant) throw new NotFoundException('Không xác định được nhà hàng từ giỏ hàng');

  const now = orderTime || new Date();
  const deliveryTime = new Date(now.getTime() + 45 * 60 * 1000);

  // ✅ Tạo đơn hàng
  const order = await this.orderModel.create({
    user: userId,
    restaurant,
    totalPrice,
    status: 'PENDING',
    orderTime: now,
    deliveryTime,
  });

  // ✅ Tạo chi tiết đơn hàng
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

  // ✅ Xoá toàn bộ cartItems trong giỏ
  await this.cartItemModel.deleteMany({ cart: cart._id });

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
}
