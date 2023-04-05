import {  PickType } from '@nestjs/swagger';
import { CreateOutletDto } from './create-outlet.dto';


export class UpdateOutletDto extends PickType(CreateOutletDto,['name','address','description','phone','googleMapUrl']){

}

