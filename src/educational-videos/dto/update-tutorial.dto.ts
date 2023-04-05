import {  PickType } from '@nestjs/swagger';
import { CreateTutorialDto } from './create-tutorial.dto';


export class UpdateTutorialDto extends PickType(CreateTutorialDto,['category','title','video','description']){

}

