  import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    Request,
    UseGuards
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
  import { ResetPasswordDto } from './dto/reset-password.dto';

  import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
    ApiResponse
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
  import { Public } from '@/decorator/customize';
  import { Roles } from '@/decorator/roles.decorator';
  import { RolesGuard } from '@/auth/passport/roles.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyResetCodeDto } from './dto/verify-resetcode.dto';
import { UserProfileDto } from './dto/user-profile.dto';

  @ApiTags('Accounts')
  @Controller('accounts')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'List All Accounts' })
    @ApiQuery({ name: 'query', required: false })
    @ApiQuery({ name: 'current', required: false, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, example: 10 })
    @ApiQuery({ name: 'role', required: false })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    findAll(
      @Query('query') query: string,
      @Query('current') current: string,
      @Query('pageSize') pageSize: string,
      @Query('role') role: string,
    ) {
      return this.usersService.findAll(query, +current, +pageSize, role);
    }

    @Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Retrieve current user profile' })
@ApiResponse({ status: 200, type: UserProfileDto })
getCurrentUser(@Request() req): Promise<UserProfileDto> {
  return this.usersService.findOne(req.user._id);
}


    @Put('me')
    @ApiOperation({ summary: 'Update Existing Account' })
    @ApiBody({ type: UpdateUserDto })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateCurrentUser(@Request() req, @Body() dto: UpdateUserDto) {
      return this.usersService.update(req.user._id, dto);
    }

    @Delete('me')
    @ApiOperation({ summary: 'Delete Existing Account' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    deleteCurrentUser(@Request() req) {
      return this.usersService.remove(req.user._id);
    }



@Put('change-password')
@ApiOperation({ summary: 'Change current user password' })
@ApiBody({ type: ChangePasswordDto })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
  return this.usersService.changePassword(req.user._id, dto.oldPassword, dto.newPassword);
}

    @Get(':account_id')
    @ApiOperation({ summary: 'Retrieve Account' })
    @ApiParam({ name: 'account_id' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findOne(@Param('account_id') id: string) {
      return this.usersService.findOne(id);
    }

    @Put(':account_id')
    @ApiOperation({ summary: 'Update Existing Account' })
    @ApiParam({ name: 'account_id' })
    @ApiBody({ type: UpdateUserDto })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    update(@Param('account_id') id: string, @Body() dto: UpdateUserDto) {
      return this.usersService.update(id, dto);
    }

    @Delete(':account_id')
    @ApiOperation({ summary: 'Delete Existing Account' })
    @ApiParam({ name: 'account_id' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    remove(@Param('account_id') id: string) {
      return this.usersService.remove(id);
    }

 @Post('password-reset-request')
@Public()
@ApiOperation({ summary: 'Request Password Reset' })
requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
  return this.usersService.requestPasswordReset(dto.email);
}

@Post('verify-reset-code')
@Public()
@ApiOperation({ summary: 'Verify reset code' })
verifyResetCode(@Body() dto: VerifyResetCodeDto) {
  return this.usersService.verifyResetCode(dto.email, dto.code);
}

@Post('reset-password')
@Public()
@ApiOperation({ summary: 'Reset password' })
resetPassword(@Body() dto: ResetPasswordDto) {
  return this.usersService.resetPassword(dto.resetCode, dto.newPassword);
}


  }
