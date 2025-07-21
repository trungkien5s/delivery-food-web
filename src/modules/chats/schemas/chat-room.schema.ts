import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// entities/chat-room.entity.ts
@Schema({ timestamps: true })
export class ChatRoom extends Document {
  @Prop({ enum: ['support', 'order'], required: true })
  type: 'support' | 'order'; // phân loại phòng

  @Prop({ type: Types.ObjectId, ref: 'Order', required: false })
  orderId?: Types.ObjectId; // chỉ có nếu là loại 'order'

  @Prop({ type: [Types.ObjectId], required: true, ref: 'User' })
  participants: Types.ObjectId[];

  @Prop({ type: String, enum: ['user-shipper', 'user-support', 'shipper-support'], required: true })
  relationType: 'user-shipper' | 'user-support' | 'shipper-support';
}


export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
