import { ApiProperty } from '@nestjs/swagger';
import {  IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
export class CreateCategoryDto {

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Arts' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'img src' })
  image?: string;

  
}
