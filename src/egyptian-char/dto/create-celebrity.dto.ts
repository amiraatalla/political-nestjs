import { ApiProperty } from '@nestjs/swagger';
import {  IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { EgCharCategoriesEnum } from '../enums/char-categories.enum';

export class CreateCelebrityDto {

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Ahmed Zewail' })
  name?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: ["img1"]  })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: ["video"]  })
  videos?: string[];

  @IsOptional()
  @IsEnum( EgCharCategoriesEnum)
  @ApiProperty({ example:  EgCharCategoriesEnum.SCIENCE })
  category?:  EgCharCategoriesEnum;
  

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Ahmed Hassan Zewail was born in Damanhour, Egypt, on the twenty-sixth of February' })
  bio?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Ahmed Hassan Zewail was born in Damanhour, Egypt, on the twenty-sixth of February' })
  educational?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Ahmed Hassan Zewail was born in Damanhour, Egypt, on the twenty-sixth of February' })
  achievements?: string;

}
