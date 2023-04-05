import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Newspaper } from 'src/newspaper/entities/newspaper.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { EgCharCategoriesEnum } from '../enums/char-categories.enum';


export type CelebritiesDoc = Celebrities & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Celebrities extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref:Newspaper.name})
  newspaperId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: true , ref:User.name})
  editorId: Types.ObjectId;

  @Prop({type: String, enum : Object.values(EgCharCategoriesEnum),required: false}) 
  category: EgCharCategoriesEnum;

  @Prop({type: String,required: false}) 
  name: string;
  
  @Prop({type: [String],required: false}) 
  images: string[];

  @Prop({type: [String],required: false}) 
  videos: string[];

  @Prop({type: String,required: false}) 
  bio: string;

  @Prop({type: String,required: false}) 
  educational: string;

  @Prop({type: String,required: false}) 
  achievements : string;
  //add
  @Prop({ type: [Types.ObjectId], required: true , ref: User.name})
  favorites: Types.ObjectId[]; 
  @Prop({type: Boolean,required: false , default : false}) 
  isPublished: boolean;
  @Prop({type: Boolean,required: false , default : false}) 
  isReviewd: boolean;
  @Prop({type: Number,required: false , default : false}) 
  views: number;
}
export const CelebritiesSchema = SchemaFactory.createForClass(Celebrities);
