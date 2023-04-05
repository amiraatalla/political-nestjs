import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class ReviewComplaintDto {

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isReviewd: boolean;
}

