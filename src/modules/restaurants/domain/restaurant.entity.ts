export class Restaurant {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public phone: string,
    public email: string,
    public address: string,
    public image: string,
    public rating: number = 0,
    public isOpen: boolean = true,
    public openTime: string,
    public closeTime: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Factory method - tạo restaurant mới
  static create(data: {
    name: string;
    description?: string;
    phone: string;
    email: string;
    address: string;
    image?: string;
    openTime?: string;
    closeTime?: string;
  }): Restaurant {
    // Business rules - quy tắc nghiệp vụ
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tên nhà hàng không được để trống');
    }

    if (!data.phone || !data.phone.match(/^[0-9]{10,11}$/)) {
      throw new Error('Số điện thoại không hợp lệ');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Email không hợp lệ');
    }

    if (!data.address || data.address.trim().length === 0) {
      throw new Error('Địa chỉ không được để trống');
    }

    return new Restaurant(
      this.generateId(),
      data.name.trim(),
      data.description || '',
      data.phone,
      data.email.toLowerCase(),
      data.address.trim(),
      data.image || '',
      0,
      true,
      data.openTime || '08:00',
      data.closeTime || '22:00'
    );
  }

  // Business methods - các phương thức nghiệp vụ
  updateInfo(data: {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    image?: string;
    openTime?: string;
    closeTime?: string;
  }): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Tên nhà hàng không được để trống');
      }
      this.name = data.name.trim();
    }

    if (data.phone !== undefined) {
      if (!data.phone.match(/^[0-9]{10,11}$/)) {
        throw new Error('Số điện thoại không hợp lệ');
      }
      this.phone = data.phone;
    }

    if (data.email !== undefined) {
      if (!data.email.includes('@')) {
        throw new Error('Email không hợp lệ');
      }
      this.email = data.email.toLowerCase();
    }

    if (data.address !== undefined) {
      if (!data.address || data.address.trim().length === 0) {
        throw new Error('Địa chỉ không được để trống');
      }
      this.address = data.address.trim();
    }

    if (data.description !== undefined) this.description = data.description;
    if (data.image !== undefined) this.image = data.image;
    if (data.openTime !== undefined) this.openTime = data.openTime;
    if (data.closeTime !== undefined) this.closeTime = data.closeTime;
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  updateRating(newRating: number): void {
    if (newRating < 0 || newRating > 5) {
      throw new Error('Rating phải từ 0 đến 5');
    }
    this.rating = newRating;
  }

  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
