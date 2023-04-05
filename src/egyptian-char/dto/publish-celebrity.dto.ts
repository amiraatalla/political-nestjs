import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class PublishCelebrityDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isPublished: boolean;
}

