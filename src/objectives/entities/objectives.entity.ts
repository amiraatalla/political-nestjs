import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Newspaper } from 'src/newspaper/entities/newspaper.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';


export type ObjectivesDoc = Objectives & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Objectives extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref:Newspaper.name})
  newspaperId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, required: true , ref: User.name})
  editorId: Types.ObjectId;

  @Prop({type: String,required: false}) 
  title: string;
  
  @Prop({type: String,required: false}) 
  content: string;

}
export const ObjectivesSchema = SchemaFactory.createForClass(Objectives);
