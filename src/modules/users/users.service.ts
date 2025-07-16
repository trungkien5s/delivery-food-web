import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

  async isEmailExist(email: string) {
    const user = await this.userModel.exists({ email });
    return !!user;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;

    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email đã tồn tại: ${email}. Vui lòng sử dụng email khác`);
    }

    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });

    return { _id: user._id };
  }

  async findAll(query: string, current: number, pageSize: number, role?: string) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    if (role) {
      filter.role = role;
    }

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    return { results, totalPages };
  }
  async findByEmail(email: string){
  return await this.userModel.findOne({ email });
}


  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Id không đúng định dạng');
    }
    return this.userModel.findById(id).select('-password');
  }

  async update(id: string, dto: UpdateUserDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Id không đúng định dạng');
    }
    await this.userModel.updateOne({ _id: id }, { ...dto });
    return { message: 'Cập nhật thành công' };
  }

  
async activateUser(userId: string) {
  // Cập nhật isActive = true và xóa activationCode
  return await this.userModel.findByIdAndUpdate(
    userId,
    {
      isActive: true,
      activationCode: null,
      activationCodeExpiry: null,
      activatedAt: new Date()
    },
    { new: true }
  );
}

async updateActivationCode(userId: string, activationCode: string, expiry: Date) {
  return await this.userModel.findByIdAndUpdate(
    userId,
    {
      activationCode,
      activationCodeExpiry: expiry
    },
    { new: true }
  );
}

  async remove(_id: string) {
    if (!mongoose.isValidObjectId(_id)) {
      throw new BadRequestException('Id không đúng định dạng');
    }
    await this.userModel.deleteOne({ _id });
    return { message: 'Xoá thành công' };
  }

  async changeRole(id: string, role: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Id không đúng định dạng');
    }
    await this.userModel.updateOne({ _id: id }, { role });
    return { message: 'Đổi role thành công' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email không tồn tại');
    }

 const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
const codeExpired = dayjs().add(10, 'minutes').toDate();

await this.userModel.updateOne({ _id: user._id }, { resetCode, codeExpired });

await this.mailerService.sendMail({
  to: email,
  subject: 'Mã xác nhận đặt lại mật khẩu',
  template: 'reset-password-code',
  context: {
    name: user.name,
    code: resetCode,
  },
});

    return { message: 'Đã gửi email reset password' };
  }

async resetPassword(code: string, newPassword: string) {
  const user = await this.userModel.findOne({ resetCode: code });

  if (!user) {
    throw new BadRequestException('Mã xác nhận không hợp lệ');
  }

  if (user.codeExpired < new Date()) {
    throw new BadRequestException('Mã xác nhận đã hết hạn');
  }

  const hashed = await hashPasswordHelper(newPassword);
  await this.userModel.updateOne(
    { _id: user._id },
    { password: hashed, resetCode: null, codeExpired: null }
  );

  return { message: 'Đổi mật khẩu thành công' };
}

async changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await this.userModel.findById(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new BadRequestException('Old password is incorrect');
  }

  const hashedNewPassword = await hashPasswordHelper(newPassword);
  await this.userModel.updateOne(
    { _id: userId },
    { password: hashedNewPassword }
  );

  return { message: 'Password changed successfully' };
}

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;

    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email đã tồn tại: ${email}. Vui lòng sử dụng email khác`);
    }

    const hashPassword = await hashPasswordHelper(password);
const activationCode = Math.floor(100000 + Math.random() * 900000).toString();// hoặc random 6 số
const user = await this.userModel.create({
  name,
  email,
  password: hashPassword,
  isActive: false,
  activationCode,
  activationCodeExpiry: dayjs().add(30, 'minutes').toDate(), // 30 phút
});

await this.mailerService.sendMail({
  to: user.email,
  subject: 'Activate your account at @trungkien',
  template: 'register',
  context: {
    name: user?.name ?? user.email,
    activationCode: activationCode, // ✅ sử dụng activationCode
  },
});


    return { _id: user._id };
  }
}
