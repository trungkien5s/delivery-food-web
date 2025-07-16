import { comparePasswordHelper } from '@/helpers/util';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;

    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) return null;

    return user;
  }

  async login(user: any) {
    // Kiểm tra xem account đã được activate chưa
    if (!user.isActive) {
      throw new BadRequestException('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và kích hoạt tài khoản.');
    }

    const payload = {
      username: user.email,
      sub: user._id,
      role: user.role,
    };
    
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    // check email đã tồn tại
    // hash password
    return await this.usersService.handleRegister(registerDto);
  };

  async activateAccount(activateDto: ActivateAccountDto) {
    const { email, activationCode } = activateDto;
    
    // Tìm user theo email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này.');
    }

    // Kiểm tra xem tài khoản đã được kích hoạt chưa
    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt trước đó.');
    }

    // Kiểm tra activation code
    if (user.activationCode !== activationCode) {
      throw new BadRequestException('Mã kích hoạt không đúng.');
    }

    // Kiểm tra xem code có hết hạn không (nếu có trường expiry)
    if (user.activationCodeExpiry && new Date() > user.activationCodeExpiry) {
      throw new BadRequestException('Mã kích hoạt đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.');
    }

    // Kích hoạt tài khoản
    await this.usersService.activateUser(user._id.toString());

    return {
      message: 'Tài khoản đã được kích hoạt thành công!',
      statusCode: 200,
      data: {
        email: user.email,
        activatedAt: new Date().toISOString()
      }
    };
  }

  async resendActivationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này.');
    }

    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt trước đó.');
    }

    // Tạo activation code mới
    const newActivationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const activationCodeExpiry = new Date();
    activationCodeExpiry.setMinutes(activationCodeExpiry.getMinutes() + 15); // Hết hạn sau 15 phút

    // Cập nhật activation code mới
    await this.usersService.updateActivationCode(user._id.toString(), newActivationCode, activationCodeExpiry);

    // Gửi email với code mới
    await this.mailerService.sendMail({
      to: email,
      subject: 'Mã kích hoạt tài khoản mới',
      template: 'register',
      context: {
        name: user.name,
        activationCode: newActivationCode,
      },
    });

    return {
      message: 'Mã kích hoạt mới đã được gửi tới email của bạn.',
      statusCode: 200,
      data: {
        email: email,
        expiryTime: activationCodeExpiry.toISOString()
      }
    };
  }

  // Thêm method logout
  async logout(user: any) {
    return {
      message: 'Đăng xuất thành công',
      statusCode: 200,
      data: {
        userId: user._id || user.sub,
        email: user.email || user.username,
        logoutTime: new Date().toISOString()
      }
    };
  }
}