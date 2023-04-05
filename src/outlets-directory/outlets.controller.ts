import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { OutletsSearchOptions } from './dto/outlets-search-options.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { OutletsService } from './outlets.service';

@Controller('outlets-directory')
@ApiTags('outlets-directory')
export class OutletsController {
  constructor(
    private readonly OutletsService: OutletsService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateOutletDto })
  @ApiOperation({ summary: 'Create a Outlets - MNG+PRF' })
  async create(@Body() dto: CreateOutletDto, @Req() req: RequestWithUser) {
    return await this.OutletsService.createOutlets(req, dto);
  }

  @Get('me/favorites-or-un-favorites/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'favorites or unfavorites news' })
  async updateFavoritesList(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.OutletsService.updateFavoritesList(req,id);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get a Outlets - any' })
  async getOutlets(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.OutletsService.findOutlets(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateOutletDto })
  @ApiOperation({ summary: 'Update a Outlets - MNG+PRF' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateOutletDto) {
    return await this.OutletsService.updateOutlets(req,id, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Outlets - any' })
  async search(@Req() req: RequestWithUser,@Body() options: OutletsSearchOptions) : Promise<Pagination>{
    return await this.OutletsService.findAll(req,options);
  }

}