import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsStrongPassword } from 'src/core/decorators';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';

export class ReaderSignUpDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'amiraatalla63@gmail.com' })
  @IsNotEmpty()
  email: string;

  /** Password must be at least 8 characters and include one lowercase letter, one uppercase letter, and one digit. */
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '+33700555378' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Amira Atallah' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'cairo str.' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'image url' })
  profilePicture?: string

}
