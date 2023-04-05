import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class CreateObjectivesDto {

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Winners of the Heritage photography competition' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Prizes for the  Heritage photography competition organized by the National Organization for Urban Harmony' })
  content?: string;
 
  
}
