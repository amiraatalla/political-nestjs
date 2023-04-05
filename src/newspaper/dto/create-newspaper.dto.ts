import { ApiProperty } from '@nestjs/swagger';
import {   IsOptional, IsString, IsUrl,  } from 'class-validator';
import { IsObjectId } from 'src/core/validators';
import {Types} from 'mongoose';
import { Type } from 'class-transformer';
export class CreateNewspaperDto {

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Akhbar ALYOM' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+33700555378' })
  phoneNumber?: string;


  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Cairo str.' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'image url' })
  logo?: string

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'who I am...' })
  aboutUs?: string
  /**
  * Google maps url for the store location.
  * @example https://goo.gl/maps/L5eMZ7QpyN4T5bN37
  */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://goo.gl/maps/L5eMZ7QpyN4T5bN37' })
  googleMapUrl?: string;

  /**
 * @example https://www.facebook.com
 */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.facebook.com' })
  facebookUrl?: string;

  /**
  * @example https://www.instgram.com
  */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.instgram.com' })
  instgramUrl?: string;

  /**
    * @example https://www.twitter.com
    */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.twitter.com' })
  twitterUrl?: string;

  /**
    * @example https://www.youtube.com
    */
  @IsOptional()
  @IsUrl()
  @ApiProperty({ example: 'https://www.youtube.com' })
  youtubeUrl?: string;

  
}
