import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
import { EducationalCategoriesEnum } from '../enums/educational-categories.enum';
export class CreateTutorialDto {

  @IsOptional()
  @IsEnum(EducationalCategoriesEnum)
  @ApiProperty({ example: EducationalCategoriesEnum.SCIENCE })
  category?: EducationalCategoriesEnum;
  
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'lesson 1' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'lesson one description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'video src' })
  video?: string;
  
}
