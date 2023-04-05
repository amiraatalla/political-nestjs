import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/categories/entities/category.entity';
import { Newspaper } from 'src/newspaper/entities/newspaper.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';
import { NewsCategoriesEnum } from '../enums/news-categories.enum';


export type NewsDoc = News & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class News extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref:Newspaper.name})
  newspaperId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: true , ref: User.name})
  editorId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], required: true , ref: User.name})
  favorites: Types.ObjectId[];

  @Prop({type: String, enum : Object.values(NewsCategoriesEnum),required: false}) 
  category: NewsCategoriesEnum;

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
export const NewsSchema = SchemaFactory.createForClass(News);
