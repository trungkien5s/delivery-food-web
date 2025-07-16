import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ChatService } from "./schemas/chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";

@ApiTags('Chat')
@Controller('chats')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post()
  create(@Body() dto: CreateChatDto) {
    return this.service.create(dto);
  }

  @Get('conversation')
  getConversation(
    @Query('user') user: string,
    @Query('shipper') shipper: string,
  ) {
    return this.service.findConversation(user, shipper);
  }
  @Get('/order/:orderId')
getChatByOrder(@Param('orderId') orderId: string) {
  return this.service.findByOrder(orderId);
}


  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}
