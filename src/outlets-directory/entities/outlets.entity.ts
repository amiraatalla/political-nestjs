import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Newspaper } from 'src/newspaper/entities/newspaper.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';


export type OutletsDoc = Outlets & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Outlets extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref:Newspaper.name})
  newspaperId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: true , ref:User.name})
  editorId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], required: true , ref: User.name})
  favorites: Types.ObjectId[];
  
  @Prop({type: String,required: false}) 
  name: string;
  
  @Prop({type: String,required: false}) 
  description: string;

  @Prop({type: String,required: false}) 
  address: string;

  @Prop({type: String,required: false}) 
  phone: string;

  @Prop({type: String,required: false}) 
  googleMapUrl: string;

  @Prop({type: Number,required: false}) 
  views: number;

}
export const OutletsSchema = SchemaFactory.createForClass(Outlets);
