import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Newspaper } from 'src/newspaper/entities/newspaper.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { OpportunityCategoriesEnum } from '../enums/opportunity-categories.enum';


export type OpportunityDoc = Opportunity & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Opportunity extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref:Newspaper.name})
  newspaperId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: true , ref: User.name})
  editorId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], required: true , ref: User.name})
  favorites: Types.ObjectId[];

  @Prop({type: String, enum : Object.values(OpportunityCategoriesEnum),required: false}) 
  category: OpportunityCategoriesEnum;

  @Prop({type: String,required: false}) 
  title: string;
  
  @Prop({type: String,required: false}) 
  content: string;

  @Prop({type: [String],required: false}) 
  images: string[];

  @Prop({type: [String],required: false}) 
  videos: string[];

  @Prop({type: Boolean,required: false , default : false}) 
  isPublished: boolean;

  @Prop({type: Boolean,required: false , default : false}) 
  isReviewd: boolean;
  
  @Prop({type: Number,required: false , default : false}) 
  views: number;


}
export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);
