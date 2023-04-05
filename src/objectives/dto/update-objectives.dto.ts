import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateObjectivesDto } from './create-objectives.dto';


export class UpdateObjectivesDto extends PickType(CreateObjectivesDto,['title','content']){

}

