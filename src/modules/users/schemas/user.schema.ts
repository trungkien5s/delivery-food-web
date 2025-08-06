import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
@Prop({ required: true })
name: string;

@Prop({ required: true, unique: true })
email: string;

@Prop({ required: true })
password: string;

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

    @Prop()
refreshToken: string;

@Prop()
  refreshTokenExpiry?: Date;


  _id: string
    @Prop()
    resetCode: string;

    @Prop()
    resetCodeExpire: Date;
}


export const UserSchema = SchemaFactory.createForClass(User);
