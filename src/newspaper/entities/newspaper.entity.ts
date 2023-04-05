import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from '../../core/entities';


export type NewspaperDoc = Newspaper & Document;

@Schema({ timestamps: true, versionKey: false, id: false })
export class Newspaper extends BaseEntity {

  @Prop({ type: Types.ObjectId, required: true , ref: User.name})
  managerId: Types.ObjectId;
  @Prop({type: String,required: false}) 
  name: string;
  @Prop({ type: String, required: false })
  address: string;
  @Prop({ type: String, required: false  })
  phoneNumber: string;
  @Prop({ type: String, required: false  })
  logo: string;
  @Prop({type: String,required: false})
  aboutUs: string;
  @Prop({type: String,required: false})
  googleMapUrl: string;
  @Prop({type: String,required: false})
  facebookUrl: string;
  @Prop({type: String,required: false})
  instgramUrl: string;
  @Prop({type: String,required: false})
  twitterUrl: string;
  @Prop({type: String,required: false})
  youtubeUrl: string;

  

}
export const NewspaperSchema = SchemaFactory.createForClass(Newspaper);
