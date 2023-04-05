import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../../core/entities';
import { toHash } from '../../core/utils';
import { RolesEnum } from '../enums/roles.enum';

export type UserDoc = User & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class User extends BaseEntity {
  
  @Prop({ type: Types.ObjectId, required: false , ref: User.name})
  managerId: Types.ObjectId; 
  @Prop({ type: Types.ObjectId, required: false , ref: User.name})
  newspaperId: Types.ObjectId; 
  @Prop({ type: String, required: true, index: true, unique: true })
  email: string;
  @Prop({ type: String, required: false, set: (value: string) => toHash(value) })
  password: string;
  @Prop({ type: String, required: false })
  name: string;
  @Prop({ type: String, required: false })
  address: string;
  @Prop({ type: String, required: true  })
  phoneNumber: string;
  @Prop({ type: String, required: false  })
  profilePicture: string;
  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;
  @Prop({type: String})
  token: string
  @Prop({ type: String, enum: Object.values(RolesEnum) })
  role: RolesEnum;
  @Prop({ type: Boolean, default: true })
  active: boolean; 
  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  devicesToken: string[];

}

export const UserSchema = SchemaFactory.createForClass(User);

