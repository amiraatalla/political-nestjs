import { ApiProperty } from '@nestjs/swagger';
import {  IsArray , IsEnum, IsOptional, IsString } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
import { Transform } from 'class-transformer';
import { toObjectId } from 'src/core/utils';
import { NewsCategoriesEnum } from '../enums/news-categories.enum';
export class CreateNewsDto {

  @IsOptional()
  @IsEnum( NewsCategoriesEnum)
  @ApiProperty({ example:  NewsCategoriesEnum.ARTS })
  category?:  NewsCategoriesEnum;
  
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Winners of the Heritage photography competition' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Prizes for the  Heritage photography competition organized by the National Organization for Urban Harmony' })
  content?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: ["img1"]  })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: ["video1"]  })
  videos?: string[];

  
  
}
