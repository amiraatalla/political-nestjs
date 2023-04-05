import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class FeedbackComplaintDto {

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'complaint reply' })
    feedback?: string;
}

