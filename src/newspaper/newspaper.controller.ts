import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateNewspaperDto } from './dto/create-newspaper.dto';
import { NewspaperSearchOptions } from './dto/newspaper-search-options.dto';
import { UpdateNewspaperDto } from './dto/update-newspaper.dto';
import { NewspaperService } from './newspaper.service';

@Controller('newspaper')
@ApiTags('newspaper')
export class NewspaperController {
  constructor(
    private readonly newspaperService: NewspaperService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: CreateNewspaperDto })
  @ApiOperation({ summary: 'Create a Newspaper - MNG' })
  async create(@Body() dto: CreateNewspaperDto, @Req() req: RequestWithUser) {
    return await this.newspaperService.createNewspaper(req, dto);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(...RoleGroups.NEWSPAPER)
  @ApiOperation({ summary: 'Get a Newspaper - any' })
  async getNewspaper(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.newspaperService.findNewspaper(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: UpdateNewspaperDto })
  @ApiOperation({ summary: 'Update a Newspaper - MNG' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateNewspaperDto) {
    return await this.newspaperService.updateNewspaper(req,id, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Newspaper - any' })
  async search(@Req() req: RequestWithUser,@Body() options: NewspaperSearchOptions) : Promise<Pagination>{
    return await this.newspaperService.findAll(req,options);
  }


}