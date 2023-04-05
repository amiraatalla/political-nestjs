import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class ReviewNewsDto {

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isReviewd: boolean;
}

