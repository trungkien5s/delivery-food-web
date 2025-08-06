import { comparePasswordHelper } from '@/helpers/util';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';
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
    if (!user.isActive) {
      throw new BadRequestException('Tài khoản chưa được kích hoạt.');
    }
    const payload = { username: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
  expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRED, 
});

    // Tạo refresh token (có thể là chuỗi ngẫu nhiên hoặc JWT)
    const refreshToken = randomBytes(64).toString('hex');
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); 

    // Lưu refreshToken vào DB
    await this.usersService.saveRefreshToken(user._id, refreshToken, refreshTokenExpiry);

    return {
      user: { _id: user._id, email: user.email, name: user.name, role: user.role },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Kiểm tra refresh token trong DB
    const user = await this.usersService.findById(userId);
    if (!user || user.refreshToken !== refreshToken || new Date() > user.refreshTokenExpiry) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn.');
    }
    // Cấp access token mới
    const payload = { username: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    return { access_token: accessToken };
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
    // Xóa refresh token khỏi DB
    await this.usersService.removeRefreshToken(user._id || user.sub);
    return {
      message: 'Đăng xuất thành công',
      statusCode: 200,
      data: {
        userId: user._id || user.sub,
        email: user.email || user.username,
          logoutTime: new Date().toISOString( )
      }
    };
  }
}