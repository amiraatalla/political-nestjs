import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateObjectivesDto } from './dto/create-objectives.dto';
import { ObjectivesSearchOptions } from './dto/objectives-search-options.dto';
import { UpdateObjectivesDto } from './dto/update-objectives.dto';
import { ObjectivesService } from './objectives.service';
@Controller('objectives')
@ApiTags('objectives')
export class ObjectivesController {
  constructor(
    private readonly objectivesService: ObjectivesService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateObjectivesDto })
  @ApiOperation({ summary: 'create objective - MNG+PRF' })
  async create(@Body() dto: CreateObjectivesDto, @Req() req: RequestWithUser) {
    return await this.objectivesService.createObjectives(req, dto);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'get objective' })
  async getPublishedObjectives(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.objectivesService.getObjective(req,id);
  }



  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateObjectivesDto })
  @ApiOperation({ summary: 'update objective - MNG+PRF' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateObjectivesDto) {
    return await this.objectivesService.updateObjective(req,id, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all objectives' })
  async searchAllObjectives(@Req() req: RequestWithUser,@Body() options: ObjectivesSearchOptions) : Promise<Pagination>{
    return await this.objectivesService.findAll(req,options);
  }

}