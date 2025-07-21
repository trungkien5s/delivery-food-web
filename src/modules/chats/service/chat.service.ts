import { BadRequestException, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom } from '../schemas/chat-room.schema';
import { ChatMessage } from '../schemas/chat-message.schema';

import { User } from '@/modules/users/schemas/user.schema';
import { CreateRoomDto } from '../dto/create-message.dto';

interface CreateMessageDto {
  roomId: string;
  content: string;
  senderId: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatRoom.name) private roomModel: Model<ChatRoom>,
    @InjectModel(ChatMessage.name) private msgModel: Model<ChatMessage>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  // Tạo room nếu chưa tồn tại
  async getOrCreateRoom(dto: CreateRoomDto, currentUserId: string) {
    // Kiểm tra current user có trong participants không
    if (!dto.participants.includes(currentUserId)) {
      dto.participants.push(currentUserId);
    }

    // Kiểm tra participants tồn tại và hợp lệ
    const users = await this.userModel.find({
      _id: { $in: dto.participants.map(id => new Types.ObjectId(id)) }
    });

    if (users.length !== dto.participants.length) {
      throw new BadRequestException('Some participants are invalid');
    }

    // Validate logic theo relationType
    const roles = users.map(u => u.role);
    const valid = this.validateParticipantRoles(dto.relationType, roles);
    if (!valid) {
      throw new BadRequestException('Participants do not match relationType');
    }

    const query: any = {
      type: dto.type,
      participants: { $all: dto.participants.map(id => new Types.ObjectId(id)) },
      relationType: dto.relationType,
    };

    if (dto.type === 'order' && dto.orderId) {
      query.orderId = new Types.ObjectId(dto.orderId);
    }

    let room = await this.roomModel.findOne(query);
    if (!room) {
      room = await this.roomModel.create({
        ...dto,
        participants: dto.participants.map(id => new Types.ObjectId(id)),
        orderId: dto.orderId ? new Types.ObjectId(dto.orderId) : undefined,
      });
    }

    return room;
  }

  private validateParticipantRoles(
    relationType: 'user-support' | 'user-shipper' | 'shipper-support',
    roles: string[]
  ): boolean {
    const roleSet = new Set(roles);

    switch (relationType) {
      case 'user-support':
        return roleSet.has('USERS') && (roleSet.has('ADMIN') || roleSet.has('SUPPORT'));
      case 'user-shipper':
        return roleSet.has('USERS') && roleSet.has('SHIPPER');
      case 'shipper-support':
        return roleSet.has('SHIPPER') && (roleSet.has('ADMIN') || roleSet.has('SUPPORT'));
      default:
        return false;
    }
  }

  // Lấy tất cả room mà user là thành viên
  async getUserRooms(userId: string) {
    return this.roomModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('participants', 'name email role')
      .sort({ updatedAt: -1 });
  }

  // FIXED: Participant checking logic
  private isUserInParticipants(participants: (Types.ObjectId | any)[], userId: string): boolean {
    return participants.some(p => {
      // Handle both ObjectId and populated user objects
      if (p._id) {
        // If it's a populated object
        return p._id.toString() === userId;
      } else {
        // If it's a raw ObjectId
        return p.toString() === userId;
      }
    });
  }

  // Gửi tin nhắn mới và cập nhật room timestamp - FIXED VERSION
  async createMessage(dto: CreateMessageDto) {
    this.logger.log(`Creating message: roomId=${dto.roomId}, senderId=${dto.senderId}`);
    
    // Kiểm tra user có quyền gửi tin nhắn trong room này không
    const room = await this.roomModel.findById(dto.roomId);
    if (!room) {
      this.logger.warn(`Room not found: ${dto.roomId}`);
      throw new BadRequestException('Room not found');
    }

    this.logger.log(`Room participants: ${room.participants.map(p => p.toString()).join(', ')}`);

    // FIXED: Use the new participant checking method
    const isParticipant = this.isUserInParticipants(room.participants, dto.senderId);
    this.logger.log(`Checking if sender ${dto.senderId} is participant: ${isParticipant}`);

    if (!isParticipant) {
      this.logger.warn(`User ${dto.senderId} not authorized for room ${dto.roomId}`);
      throw new ForbiddenException('You are not a participant in this room');
    }

    const message = await this.msgModel.create({
      roomId: new Types.ObjectId(dto.roomId),
      content: dto.content,
      senderId: new Types.ObjectId(dto.senderId),
    });

    this.logger.log(`Message created with ID: ${message._id}`);

    // Cập nhật room timestamp
    await this.roomModel.findByIdAndUpdate(dto.roomId, { 
      updatedAt: new Date(),
      lastMessageAt: new Date()
    });

    const populatedMessage = await message.populate('senderId', 'name email role');
    this.logger.log(`Message populated and ready to broadcast`);
    
    return populatedMessage;
  }

  // Lấy danh sách tin nhắn theo room
  async getMessages(roomId: string, userId: string) {
    // Kiểm tra user có quyền xem tin nhắn không
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new BadRequestException('Room not found');
    }

    // FIXED: Use the new participant checking method
    const isParticipant = this.isUserInParticipants(room.participants, userId);

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    return this.msgModel
      .find({ roomId: new Types.ObjectId(roomId) })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });
  }

  // Tìm room theo đơn hàng (dành cho user ↔ shipper)
  async getRoomByOrder(orderId: string) {
    return this.roomModel
      .findOne({ 
        orderId: new Types.ObjectId(orderId), 
        type: 'order' 
      })
      .populate('participants', 'name email role');
  }

  // Tìm tất cả support room của user hoặc shipper
  async getSupportRooms(userId: string) {
    return this.roomModel
      .find({
        type: 'support',
        participants: new Types.ObjectId(userId),
      })
      .populate('participants', 'name email role')
      .sort({ updatedAt: -1 });
  }

  // Lấy room theo ID (dành cho WebSocket) - ENHANCED VERSION
  async getRoomById(roomId: string) {
    const room = await this.roomModel
      .findById(roomId)
      .populate('participants', 'name email role');
    
    if (room) {
      this.logger.log(`Room found: ${roomId}, participants: ${room.participants.length}`);
    } else {
      this.logger.warn(`Room not found: ${roomId}`);
    }
    
    return room;
  }

  // FIXED: Method to check if user is participant (helper for WebSocket)
  async isUserParticipant(roomId: string, userId: string): Promise<boolean> {
    const room = await this.roomModel.findById(roomId);
    if (!room) return false;

    return this.isUserInParticipants(room.participants, userId);
  }
}