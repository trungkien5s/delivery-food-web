import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateChatDto } from "../dto/create-chat.dto";
import { Chat, ChatDocument } from "./chat.schema";

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private model: Model<ChatDocument>) {}

async create(dto: CreateChatDto) {
  const { user, shipper, order, message } = dto;

  if (!user || !shipper || !order || !message) {
    throw new BadRequestException('Thiếu trường bắt buộc: user, shipper, order, message');
  }

  return this.model.create(dto);
}

async findConversation(userId: string, shipperId: string) {
  const messages = await this.model
    .find({ user: userId, shipper: shipperId })
    .sort({ createdAt: 1 })
    .exec();

  if (!messages || messages.length === 0) {
    throw new NotFoundException('Không tìm thấy cuộc trò chuyện giữa user và shipper này.');
  }

  return messages;
}

async findByOrder(orderId: string) {
  const chats = await this.model.find({ order: orderId }).sort({ createdAt: 1 }).exec();

  if (!chats || chats.length === 0) {
    throw new NotFoundException(`Không có tin nhắn nào cho đơn hàng ID: ${orderId}`);
  }

  return chats;
}

async markAsRead(id: string) {
  const updated = await this.model.findByIdAndUpdate(id, { read: true }, { new: true });

  if (!updated) {
    throw new NotFoundException(`Không tìm thấy tin nhắn với ID: ${id}`);
  }

  return updated;
}
}
