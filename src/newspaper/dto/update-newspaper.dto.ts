import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateNewspaperDto } from './create-newspaper.dto';


export class UpdateNewspaperDto extends PickType(CreateNewspaperDto,['name','phoneNumber','facebookUrl','youtubeUrl','twitterUrl','googleMapUrl','instgramUrl','logo','address','aboutUs']){

}

