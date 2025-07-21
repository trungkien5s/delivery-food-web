import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './service/chat.service';

import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-message.dto';
import { SendMessageDto } from './dto/chat-message.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('rooms')
  createRoom(@Body() dto: CreateRoomDto, @Request() req) { // Added req parameter
    return this.chatService.getOrCreateRoom(dto, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rooms/me')
  getMyRooms(@Request() req) {
    return this.chatService.getUserRooms(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:roomId/messages')
  sendMessage(
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
    @Request() req
  ) {
    return this.chatService.createMessage({
      roomId,
      content: dto.content,
      senderId: req.user._id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('rooms/:roomId/messages')
  getMessages(@Param('roomId') roomId: string, @Request() req) { // Added req for security
    return this.chatService.getMessages(roomId, req.user._id);
  }
}
