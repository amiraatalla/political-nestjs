import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';


export class HandleComplaintDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true })
    isHandled: boolean;
}

