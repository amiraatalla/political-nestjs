import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail() 
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'amiraatalla63@gmail.com' })
  @IsNotEmpty()
  email: string;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  userId: string;
}
