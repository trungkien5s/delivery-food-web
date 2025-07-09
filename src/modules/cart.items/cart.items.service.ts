import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CartItem, CartItemDocument } from './schemas/cart.items.schema';
import { MenuItem } from '@/modules/menu.items/schemas/menu.item.schema';
import { MenuItemOption } from '@/modules/menu.item.options/schemas/menu.item.option.schema';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from '../carts/schemas/carts.schema';

@Injectable()
export class CartItemsService {
constructor(
  @InjectModel(CartItem.name)
  private readonly cartItemModel: Model<CartItemDocument>,

  @InjectModel(MenuItem.name)
  private readonly menuItemModel: Model<MenuItem>,

  @InjectModel(MenuItemOption.name)
  private readonly menuItemOptionModel: Model<MenuItemOption>,

  @InjectModel(Cart.name) // 👈 Thêm cái này
  private readonly cartModel: Model<Cart>,
) {}

  async findAllByUser(userId: string) {
    return this.cartItemModel
      .find({ user: userId })
      .populate('menuItem')
      .populate('selectedOptions');
  }

async create(userId: string, dto: CreateCartItemDto) {
  if (!isValidObjectId(dto.menuItem)) {
    throw new NotFoundException('MenuItem ID không hợp lệ');
  }

  // Lấy thông tin menuItem và nhà hàng
  const newMenuItem = await this.menuItemModel.findById(dto.menuItem).populate({
    path: 'menu',
    populate: { path: 'restaurant', select: '_id' },
  });

  if (!newMenuItem) throw new NotFoundException('Không tìm thấy MenuItem');

  // Kiểm tra selectedOptions nếu có
  if (dto.selectedOptions?.length > 0) {
    const validOptions = await this.menuItemOptionModel.find({
      _id: { $in: dto.selectedOptions },
      menuItem: dto.menuItem,
    });

    if (validOptions.length !== dto.selectedOptions.length) {
      throw new NotFoundException('Một hoặc nhiều tuỳ chọn món ăn không hợp lệ');
    }
  }

  const cart = await this.cartModel.findOne({ user: userId });
  if (!cart) throw new NotFoundException('Không tìm thấy giỏ hàng');

  // Lấy restaurant ID từ menu
  const restaurantId = (newMenuItem.menu as any)?.restaurant?._id?.toString();
  if (!restaurantId) {
    throw new NotFoundException(`Không xác định được nhà hàng từ menu của món ăn có ID: ${dto.menuItem}`);
  }

  // Kiểm tra các món trong cart để đảm bảo cùng nhà hàng
  const existingItems = await this.cartItemModel.find({ cart: cart._id }).populate({
    path: 'menuItem',
    populate: { path: 'menu', populate: { path: 'restaurant', select: '_id' } },
  });

  if (existingItems.length > 0) {
    const existingRestaurantId = (existingItems[0].menuItem as any)?.menu?.restaurant?._id?.toString();
    if (existingRestaurantId && existingRestaurantId !== restaurantId) {
      throw new NotFoundException('Bạn chỉ có thể đặt món từ một nhà hàng trong mỗi đơn hàng.');
    }
  }

  // ✅ Nếu đã có món giống hệt (cùng menuItem + selectedOptions), cộng dồn
  const existingItem = await this.cartItemModel.findOne({
    cart: cart._id,
    menuItem: dto.menuItem,
    selectedOptions: dto.selectedOptions || [],
  });

  if (existingItem) {
    existingItem.quantity += dto.quantity;
    await existingItem.save();
    return existingItem;
  }

  // ✅ Tạo mới nếu chưa có
  const created = await this.cartItemModel.create({
    cart: cart._id,
    menuItem: dto.menuItem,
    quantity: dto.quantity,
    selectedOptions: dto.selectedOptions || [],
  });

  return created;
}




  async update(itemId: string, dto: UpdateCartItemDto) {
    const updated = await this.cartItemModel.findByIdAndUpdate(itemId, dto, { new: true });
    if (!updated) throw new NotFoundException('Không tìm thấy để cập nhật');
    return updated;
  }

  async remove(itemId: string) {
    const deleted = await this.cartItemModel.findByIdAndDelete(itemId);
    if (!deleted) throw new NotFoundException('Không tìm thấy để xoá');
    return { message: 'Xoá thành công' };
  }
}
