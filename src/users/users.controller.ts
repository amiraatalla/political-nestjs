import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { JwtCompletedGuard } from 'src/auth/guards/jwt-completed.guard';
import { RequestWithUser } from 'src/core/interfaces';
import { Pagination } from 'src/core/shared';
import { toObjectId } from 'src/core/utils';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { ChangeEmailDto } from './dto/change-email.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeactiveUserDto } from './dto/deactive-user.dto';
import { UpdateUserDeviceTokenDto } from './dto/update-user-device-token.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchOptions } from './dto/user-search-options.dto';
import { User } from './entities/user.entity';
import { RoleGroups, RolesEnum } from './enums/roles.enum';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')

export class UsersController {
  constructor(
    private readonly usersService: UsersService,
        private readonly sysLogsService: SYSLogService,

  ) { }


  @Post('/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create super admin with password -SA' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createWithPassword(createUserDto);
  }

  @Post('/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all users - SA' })
  async search(@Body() options: UserSearchOptions): Promise<Pagination> {
    return await this.usersService.findAll(options);
  }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'Find one user by id -SA' })
  async findUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOneById(id, { password: 0 , pin: 0 });
  }
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find me - any' })
  async me(@Req() req: RequestWithUser): Promise<User> {
    return await this.usersService.me(req);
  }

  @Get('/me/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiOperation({ summary: 'Find user under the newspaper - MNG' })
  async myUser(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.usersService.myUser(req, id);
  }

  
  @Post('/me/active-search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find active users under my newspaper - MNG' })
  async myActiveUsers(@Req() req: RequestWithUser,@Body() options: UserSearchOptions): Promise<Pagination> {
    return await this.usersService.findMyActiveUsers(options, req);
  }
  
  @Post('/me/deactive-search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find deactive users under my newspaper - MNG' })
  async myDeactiveUsers(@Req() req: RequestWithUser,@Body() options: UserSearchOptions): Promise<Pagination> {
    return await this.usersService.findMyDeActiveUsers(options, req);
  }
 
  @Patch('/me/update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update me - any' })
  async updateMe(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.usersService.updateMe(req, updateUserDto);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiOperation({ summary: 'Update one user under the newspaper - MNG' })
  async updateMyUser(@Req() req: RequestWithUser, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.usersService.updateMyUser(req, id, updateUserDto);
  }



  @Patch('device-token/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update one user device token by id - any' })
  updateUserDeviceToken(
    @Param('id') id: string,
    @Body() dto: UpdateUserDeviceTokenDto,
  ) {
     this.sysLogsService.create({
      userId: id,
      action: ActionsEnum.UPDATE_USER,
    });

    return this.usersService.updateUserDeviceToken(id, dto);
  }

  @Post('/deactive/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiBody({ type: DeactiveUserDto })
  @ApiOperation({ summary: 'Deactive any user by super admin - SA' })
  async deactiveUser(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: DeactiveUserDto,
  ): Promise<User> {
    return await this.usersService.deactiveUser(req, id, dto);
  }

  @Post('/me/deactive-my-user/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: DeactiveUserDto })
  @ApiOperation({ summary: 'Deactive user under me by manager - MNG' })
  async deactiveMyUser(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: DeactiveUserDto,
  ): Promise<User> {
    return await this.usersService.deactiveMyUser(req, id, dto);
  }

  @Post('/profile')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiOperation({ summary: 'Create a profile for users under Manager - MNG' })
  @ApiBody({ type: CreateProfileDto })
  createProfile(@Req() req: RequestWithUser, @Body() dto: CreateProfileDto) {
    return this.usersService.createProfile(req, dto);
  }

}