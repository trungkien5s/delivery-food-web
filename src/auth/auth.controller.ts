import { Controller, Get, Post, Body, Request, UseGuards, Param } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiParam } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';


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

  @Post('activate')
  @Public()
  @ResponseMessage("Account activated successfully")
  @ApiOperation({ summary: 'Activate account with activation code' })
  @ApiBody({ type: ActivateAccountDto })
  @ApiOkResponse({ description: 'Account activated successfully', type: MessageResponseDto })
  activateAccount(@Body() activateDto: ActivateAccountDto) {
    return this.authService.activateAccount(activateDto);
  }

  @Post('resend-activation')
  @Public()
  @ResponseMessage("Activation code resent successfully")
  @ApiOperation({ summary: 'Resend activation code' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' }
      }
    }
  })
  @ApiOkResponse({ description: 'Activation code resent successfully', type: MessageResponseDto })
  resendActivationCode(@Body() body: { email: string }) {
    return this.authService.resendActivationCode(body.email);
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

}