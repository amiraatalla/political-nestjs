import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class PublishOpportunityDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isPublished: boolean;
}

