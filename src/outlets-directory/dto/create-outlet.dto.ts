import { ApiProperty } from '@nestjs/swagger';
import {  IsArray, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
export class CreateOutletDto {

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'name' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'cairo str.' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+201022347865'})
  phone?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://google.com' })
  googleMapUrl?: string;

}
