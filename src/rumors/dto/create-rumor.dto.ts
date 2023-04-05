import { ApiProperty } from '@nestjs/swagger';
import {  IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
export class CreateRumorDto {

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'title' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'fact' })
  fact?: string;

  
}
