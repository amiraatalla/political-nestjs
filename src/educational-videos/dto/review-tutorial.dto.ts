import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class ReviewTutorialDto {

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isReviewd: boolean;
}

