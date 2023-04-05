import { ApiProperty } from '@nestjs/swagger';
import {  IsArray , IsEnum, IsOptional, IsString } from 'class-validator';
import { OpportunityCategoriesEnum } from '../enums/opportunity-categories.enum';
export class CreateOpportunityDto {

  @IsOptional()
  @IsEnum( OpportunityCategoriesEnum)
  @ApiProperty({ example:  OpportunityCategoriesEnum.CAT_TWO })
  category?:  OpportunityCategoriesEnum;
  
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
