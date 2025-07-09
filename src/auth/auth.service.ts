import { comparePasswordHelper } from '@/helpers/util';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;

    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) return null;

    return user;
    // const payload = { sub: user._id, username: user.email };
    // return {
    //   access_token: await this.jwtService.signAsync(payload),
    // };
  }

 async login(user: any) {
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