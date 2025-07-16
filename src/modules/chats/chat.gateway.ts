// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './schemas/chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Kết nối
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Join phòng chat của 1 đơn hàng
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(orderId); // join room theo orderId
    client.emit('joinedRoom', { room: orderId });
  }

  // Gửi tin nhắn từ client
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: {
      user: string;
      shipper: string;
      order: string;
      senderRole: 'user' | 'shipper' | 'support';
      message: string;
    },
  ) {
    const newChat = await this.chatService.create(payload);

    // Gửi tin nhắn đến tất cả client trong phòng đơn hàng
    this.server.to(payload.order).emit('newMessage', newChat);
  }
}
