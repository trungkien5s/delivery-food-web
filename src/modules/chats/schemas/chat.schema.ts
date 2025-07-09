import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Shipper' })
  shipper: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  order: mongoose.Types.ObjectId; 

  @Prop({ enum: ['user', 'shipper', 'support'], required: true })
  senderRole: 'user' | 'shipper' | 'support';

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
