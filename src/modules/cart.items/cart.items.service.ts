import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
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

    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
  ) {}

  async findAllByUser(userId: string) {
    // 1) Validate & cast userId
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }
    const userObjectId = new Types.ObjectId(userId);

    // 2) Tìm Cart theo user
    const cart = await this.cartModel.findOne({ user: userObjectId }).select('_id');
    if (!cart) {
      // Không có cart nào của user => rỗng
      return [];
    }

    // 3) Lấy CartItems theo cart._id
    const items = await this.cartItemModel
      .find({ cart: cart._id })
      .populate({
        path: 'menuItem',
        populate: { path: 'menu', populate: { path: 'restaurant', select: '_id name image' } }
      })
      .populate('selectedOptions')
      .lean();

    return items;
  }

  async create(userId: string, dto: CreateCartItemDto) {
    if (!isValidObjectId(dto.menuItem)) {
      throw new NotFoundException('MenuItem ID không hợp lệ');
    }

    // Lấy menuItem kèm menu và nhà hàng
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

    // ✅ Tìm hoặc tạo cart
    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await this.cartModel.create({ user: userId });
    }

    // ✅ Nếu đã có món giống hệt → cộng dồn
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

    // ✅ Thêm mới
    const created = await this.cartItemModel.create({
      cart: cart._id,
      menuItem: dto.menuItem,
      quantity: dto.quantity,
      selectedOptions: dto.selectedOptions || [],
    });

    return created;
  }

  async update(itemId: string, dto: UpdateCartItemDto) {
    if (!itemId || itemId === 'undefined') {
      throw new BadRequestException('Item ID không được để trống');
    }

    if (!isValidObjectId(itemId)) {
      throw new BadRequestException('Item ID không hợp lệ');
    }

    const updated = await this.cartItemModel.findByIdAndUpdate(itemId, dto, { new: true });
    if (!updated) throw new NotFoundException('Không tìm thấy để cập nhật');
    return updated;
  }

  async remove(itemId: string) {
    if (!itemId || itemId === 'undefined') {
      throw new BadRequestException('Item ID không được để trống');
    }

    if (!isValidObjectId(itemId)) {
      throw new BadRequestException('Item ID không hợp lệ');
    }

    const deleted = await this.cartItemModel.findByIdAndDelete(itemId);
    if (!deleted) throw new NotFoundException('Không tìm thấy để xoá');
    return { message: 'Xoá thành công' };
  }
}