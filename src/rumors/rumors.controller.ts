import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateRumorDto } from './dto/create-rumor.dto';
import { RumorsSearchOptions } from './dto/rumors-search-options.dto';
import { UpdateRumorDto } from './dto/update-rumor.dto';
import { RumorsService } from './rumors.service';

@Controller('rumors')
@ApiTags('rumors')
export class RumorsController {
  constructor(
    private readonly rumorsService: RumorsService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateRumorDto })
  @ApiOperation({ summary: 'Create a Rumors - MNG+PRF' })
  async create(@Body() dto: CreateRumorDto, @Req() req: RequestWithUser) {
    return await this.rumorsService.createRumors(req, dto);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get a Rumors - any' })
  async getRumors(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.rumorsService.findRumors(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateRumorDto })
  @ApiOperation({ summary: 'Update a Rumors - MNG+PRF' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateRumorDto) {
    return await this.rumorsService.updateRumors(req,id, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Rumors - any' })
  async search(@Req() req: RequestWithUser,@Body() options: RumorsSearchOptions) : Promise<Pagination>{
    return await this.rumorsService.findAll(req,options);
  }


}