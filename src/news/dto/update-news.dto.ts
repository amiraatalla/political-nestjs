import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateNewsDto } from './create-news.dto';


export class UpdateNewsDto extends PickType(CreateNewsDto,['title','images','content','videos','category']){

}

