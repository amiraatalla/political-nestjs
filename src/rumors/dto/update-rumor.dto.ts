import {  PickType } from '@nestjs/swagger';
import { CreateRumorDto } from './create-rumor.dto';


export class UpdateRumorDto extends PickType(CreateRumorDto,['title','description','fact']){

}

