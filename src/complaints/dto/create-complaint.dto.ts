import { ApiProperty } from '@nestjs/swagger';
import {  IsArray , IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplaintCategoriesEnum } from '../enums/complaint-categories.enum';
export class CreateComplaintDto {

  @IsOptional()
  @IsEnum( ComplaintCategoriesEnum)
  @ApiProperty({ example:  ComplaintCategoriesEnum.CAT_TWO })
  category?:  ComplaintCategoriesEnum;
  
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'my complaint' })
  content?: string;

}

