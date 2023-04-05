import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsIn } from 'class-validator';
import { SignUpDto } from 'src/auth/dto';
import { RoleGroups, RolesEnum } from '../enums/roles.enum';

export class CreateProfileDto extends PickType(SignUpDto, ['password'] as const){
  @IsEmail() 
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'amiraatalla63@gmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Amira Atallah' })
  name?: string;

  @IsIn(RoleGroups.NEWSPAPER_PROFILE)
  @ApiProperty({ example:RolesEnum.EDITOR })
  role: RolesEnum;

   @IsNotEmpty()
   @IsString()
  @ApiProperty({ example: '+33700555378' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'image url' })
  profilePicture?: string

}
