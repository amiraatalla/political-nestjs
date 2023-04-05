import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class PublishNewsDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isPublished: boolean;
}

