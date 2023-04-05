import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateComplaintDto } from './create-complaint.dto';

export class UpdateComplaintDto extends PickType(CreateComplaintDto,['content','category']){

}

