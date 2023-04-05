import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { ComplaintCategoriesEnum } from '../enums/complaint-categories.enum';


export type ComplaintDoc = Complaint & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Complaint extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref: User.name})
  complainantId: Types.ObjectId;

  @Prop({type: String, enum : Object.values(ComplaintCategoriesEnum),required: false}) 
  category: ComplaintCategoriesEnum;
   
  @Prop({type: String,required: false}) 
  content: string

  @Prop({type: String,required: false}) 
  feedback: string;
  
  @Prop({type: Boolean,required: false , default : false}) 
  isReviewd: boolean;

  @Prop({type: Boolean,required: false , default : false}) 
  isHandled: boolean;

}
export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
