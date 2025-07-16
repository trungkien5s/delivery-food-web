import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    phone: string;

    @Prop()
    address: string;

    @Prop()
    image: string;

    @Prop({ default: 'USERS' })
    role: string;

    @Prop({ default: 'LOCAL' })
    accountType: string;

    @Prop({ default: false })
    isActive: boolean;

    @Prop()
    codeId: string;


      @Prop()
  activationCode: string;

  @Prop()
  activationCodeExpiry: Date;

    @Prop()
    codeExpired: Date;


    // 🔒 Thêm phần này
    @Prop()
    resetCode: string;

    @Prop()
    resetCodeExpire: Date;
}


export const UserSchema = SchemaFactory.createForClass(User);
