import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Newspaper } from 'src/newspaper/entities/newspaper.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';


export type CategoryDoc = Category & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Category extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref:Newspaper.name})
  newspaperId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: true , ref:User.name})
  editorId: Types.ObjectId;

  @Prop({type: String,required: false}) 
  name: string;
  
  @Prop({type: String,required: false}) 
  image: string;


}
export const CategorySchema = SchemaFactory.createForClass(Category);
