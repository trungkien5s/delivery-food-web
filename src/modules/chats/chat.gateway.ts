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
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './service/chat.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    _id: string;
    role: string;
    email: string;
  };
}

interface JoinRoomPayload {
  roomId: string;
}

interface SendMessagePayload {
  roomId: string;
  content: string;
}

// Add interface for populated message
interface PopulatedMessage {
  _id: string;
  content: string;
  roomId: string;
  createdAt: Date;
  senderId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: "*", // Configure theo domain của bạn
    methods: ["GET", "POST"]
  },
  // Bỏ namespace để dùng default namespace
  path: '/socket.io/'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService // Thêm JwtService để validate token
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`Client attempting connection: ${client.id}`);
      
      // Extract and validate JWT token from handshake
      const token = this.extractTokenFromHandshake(client);
      
      if (!token) {
        this.logger.warn(`No token provided for client ${client.id}`);
        client.emit('error', { message: 'Authentication token required' });
        client.disconnect();
        return;
      }

      try {
        // Verify JWT token
        const payload = this.jwtService.verify(token);
        client.user = {
          _id: payload.sub || payload._id || payload.id,
          role: payload.role,
          email: payload.email,
        };

        this.logger.log(`User ${client.user._id} (${client.user.email}) connected with socket ${client.id}`);
        
        // Join user to their personal room for notifications
        client.join(`user_${client.user._id}`);
        
        // Send connection success event
        client.emit('authenticated', { 
          message: 'Successfully authenticated', 
          user: client.user,
          socketId: client.id
        });

      } catch (jwtError) {
        this.logger.warn(`Invalid token for client ${client.id}: ${jwtError.message}`);
        client.emit('error', { message: 'Invalid authentication token' });
        client.disconnect();
        return;
      }

    } catch (error) {
      this.logger.error('Connection error:', error);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (client.user) {
      this.logger.log(`User ${client.user._id} (${client.user.email}) disconnected`);
    }
  }

  private extractTokenFromHandshake(client: AuthenticatedSocket): string | null {
    // Try multiple ways to get the token
    const authToken = client.handshake?.auth?.token;
    const headerAuth = client.handshake?.headers?.authorization;
    const queryAuth = client.handshake?.query?.token;

    this.logger.log(`Token extraction - auth.token: ${!!authToken}, header: ${!!headerAuth}, query: ${!!queryAuth}`);

    // Priority: auth.token > Authorization header > query.token
    if (authToken) {
      return authToken;
    }

    if (headerAuth) {
      return headerAuth.startsWith('Bearer ') ? headerAuth.slice(7) : headerAuth;
    }

    if (queryAuth) {
      return Array.isArray(queryAuth) ? queryAuth[0] : queryAuth;
    }

    return null;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload
  ) {
    try {
      const { roomId } = payload;
      this.logger.log(`User ${client.user?._id} attempting to join room ${roomId}`);
      
      if (!client.user) {
        client.emit('error', { message: 'Unauthorized - Please authenticate first' });
        return;
      }

      // Verify user has permission to join this room
      const room = await this.chatService.getRoomById(roomId);
      if (!room) {
        this.logger.warn(`Room ${roomId} not found`);
        client.emit('error', { message: 'Room not found' });
        return;
      }

      // Use the enhanced participant check
      const isParticipant = await this.chatService.isUserParticipant(roomId, client.user._id);

      if (!isParticipant) {
        this.logger.warn(`User ${client.user._id} attempted to join unauthorized room ${roomId}`);
        client.emit('error', { message: 'Not authorized to join this room' });
        return;
      }

      // Join the socket room
      client.join(roomId);
      
      // Get current rooms for debugging
      const rooms = Array.from(client.rooms);
      this.logger.log(`User ${client.user._id} successfully joined room ${roomId}. Current rooms: ${rooms.join(', ')}`);
      
      client.emit('joinedRoom', { 
        roomId, 
        message: 'Successfully joined room', 
        room: {
          _id: room._id,
          type: room.type,
          participants: room.participants
        }
      });
      
      // Notify others in room that user joined
      client.to(roomId).emit('userJoined', {
        user: {
          _id: client.user._id,
          email: client.user.email,
          role: client.user.role
        },
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Join room error:', error);
      client.emit('error', { message: 'Failed to join room', details: error.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload
  ) {
    try {
      const { roomId } = payload;
      this.logger.log(`User ${client.user?._id} leaving room ${roomId}`);
      
      if (!client.user) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }
      
      client.leave(roomId);
      
      const rooms = Array.from(client.rooms);
      this.logger.log(`User ${client.user._id} left room ${roomId}. Current rooms: ${rooms.join(', ')}`);
      
      client.emit('leftRoom', { roomId });
      
      // Notify others in room that user left
      client.to(roomId).emit('userLeft', {
        user: {
          _id: client.user._id,
          email: client.user.email,
          role: client.user.role
        },
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Leave room error:', error);
      client.emit('error', { message: 'Failed to leave room' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessagePayload
  ) {
    try {
      const { roomId, content } = payload;
      this.logger.log(`User ${client.user?._id} attempting to send message to room ${roomId}`);

      if (!client.user) {
        client.emit('error', { message: 'Unauthorized - Please authenticate first' });
        return;
      }

      if (!content?.trim()) {
        client.emit('error', { message: 'Message content is required' });
        return;
      }

      // Check if client is actually in the room
      const rooms = Array.from(client.rooms);
      this.logger.log(`Client rooms: ${rooms.join(', ')}`);
      
      if (!rooms.includes(roomId)) {
        this.logger.warn(`User ${client.user._id} not in room ${roomId}. Must join room first.`);
        client.emit('error', { message: 'You must join the room first' });
        return;
      }

      // Create message using service
      this.logger.log(`Creating message for room ${roomId}`);
      const message = await this.chatService.createMessage({
        roomId,
        content: content.trim(),
        senderId: client.user._id,
      });

      this.logger.log(`Message created successfully: ${message._id}`);

      // FIXED: Type assertion to handle populated message
      const populatedMessage = message as unknown as PopulatedMessage;

      // FIXED: Prepare message data for broadcast with proper sender info
      const messageData = {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        senderId: populatedMessage.senderId._id,
        roomId: populatedMessage.roomId,
        createdAt: populatedMessage.createdAt,
        // Include populated sender data
        sender: {
          _id: populatedMessage.senderId._id,
          name: populatedMessage.senderId.name,
          email: populatedMessage.senderId.email,
          role: populatedMessage.senderId.role
        }
      };

      // Log how many clients are in the room
      const socketsInRoom = await this.server.in(roomId).fetchSockets();
      this.logger.log(`Broadcasting message to ${socketsInRoom.length} clients in room ${roomId}`);
      this.logger.log(`Message data:`, JSON.stringify(messageData, null, 2));
      
      // FIXED: Emit to all clients in the room (including sender)
      this.server.to(roomId).emit('newMessage', messageData);
      this.logger.log(`Message broadcasted to room ${roomId}`);

      // ADDITIONAL: Also emit to sender to confirm delivery
      client.emit('messageSent', {
        messageId: populatedMessage._id,
        timestamp: populatedMessage.createdAt,
        message: messageData // Include full message data
      });

    } catch (error) {
      this.logger.error('Send message error:', error);
      client.emit('error', { 
        message: 'Failed to send message',
        details: error.message 
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string; isTyping: boolean }
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const { roomId, isTyping } = payload;
    
    // Check if client is in the room
    const rooms = Array.from(client.rooms);
    if (!rooms.includes(roomId)) {
      client.emit('error', { message: 'You must join the room first' });
      return;
    }
    
    // Broadcast typing status to other users in room (not including sender)
    client.to(roomId).emit('userTyping', {
      user: {
        _id: client.user._id,
        email: client.user.email,
        role: client.user.role
      },
      isTyping,
      timestamp: new Date()
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string; messageIds: string[] }
  ) {
    try {
      if (!client.user) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      const { roomId, messageIds } = payload;
      
      // Check if client is in the room
      const rooms = Array.from(client.rooms);
      if (!rooms.includes(roomId)) {
        client.emit('error', { message: 'You must join the room first' });
        return;
      }
      
      // Update read status (implement this in your service if needed)
      // await this.chatService.markMessagesAsRead(messageIds, client.user._id);

      // Notify other users that messages were read
      client.to(roomId).emit('messagesRead', {
        user: {
          _id: client.user._id,
          email: client.user.email,
          role: client.user.role
        },
        messageIds,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Mark as read error:', error);
      client.emit('error', { message: 'Failed to mark messages as read' });
    }
  }

  // NEW: Debug method to get room info
  @SubscribeMessage('getRoomInfo')
  async handleGetRoomInfo(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string }
  ) {
    try {
      if (!client.user) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      const { roomId } = payload;
      const room = await this.chatService.getRoomById(roomId);
      const socketsInRoom = await this.server.in(roomId).fetchSockets();
      const clientRooms = Array.from(client.rooms);

      const roomInfo = {
        roomId,
        roomExists: !!room,
        participantsCount: room?.participants?.length || 0,
        socketsInRoom: socketsInRoom.length,
        clientRooms,
        isClientInRoom: clientRooms.includes(roomId),
        socketDetails: socketsInRoom.map(s => ({ 
          id: s.id, 
          rooms: Array.from(s.rooms) 
        }))
      };

      this.logger.log(`Room info for ${roomId}:`, JSON.stringify(roomInfo, null, 2));
      
      client.emit('roomInfo', roomInfo);

    } catch (error) {
      this.logger.error('Get room info error:', error);
      client.emit('error', { message: 'Failed to get room info' });
    }
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  // Method to broadcast to specific room
  async broadcastToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }
} 