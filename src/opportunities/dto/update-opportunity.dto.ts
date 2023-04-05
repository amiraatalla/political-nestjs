import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateOpportunityDto } from './create-opportunity.dto';


export class UpdateOpportunityDto extends PickType(CreateOpportunityDto,['title','category','images','content','videos']){

}

