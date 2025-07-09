import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';

// Bạn có thể tạo DTO riêng cho response nếu muốn mô tả chi tiết hơn
class LoginResponseDto {
  access_token: string;
}

class MessageResponseDto {
  message: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("Fetch login")
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginAuthDto })
  @ApiOkResponse({ description: 'Login successful', type: LoginResponseDto })
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register account' })
  @ApiBody({ type: CreateAuthDto })
  @ApiCreatedResponse({ description: 'Register successful', type: MessageResponseDto })
  register(@Body() regiseterDto: CreateAuthDto) {
    return this.authService.handleRegister(regiseterDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage("Logout successfully")
  @ApiOperation({ summary: 'Logout' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Logout successful', type: MessageResponseDto })
  logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @Get('mail')
  @Public()
  @ApiOperation({ summary: 'Test sending email' })
  @ApiOkResponse({ description: 'Email sent successfully', type: MessageResponseDto })
  testMail() {
    this.mailerService.sendMail({
      to: 'kienkk24052004@gmail.com',
      subject: 'Testing Nest MailerModule ✔',
      text: 'welcome',
      template: 'register',
      context: {
        name: 'Trung Kiên',
        activationCode: 123456,
      },
    });

    return {
      message: 'Email sent successfully!',
    };
  }
}
