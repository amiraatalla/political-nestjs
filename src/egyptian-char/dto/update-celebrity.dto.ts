import {  PickType } from '@nestjs/swagger';
import { CreateCelebrityDto } from './create-celebrity.dto';


export class UpdateCelebrityDto extends PickType(CreateCelebrityDto,['name','images','videos','category','bio','educational','achievements']){

}

