import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class PublishTutorialDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isPublished: boolean;
}

