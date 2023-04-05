import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsEmail()
  @ApiProperty({ example: 'amiraatalla63@gmail.com' })
  @IsNotEmpty()
  email: string;
}
