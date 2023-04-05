import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { OpportunitiesSearchOptions } from './dto/opportunities-search-options.dto';
import { PublishOpportunityDto } from './dto/publish-opportunity.dto';
import { ReviewOpportunityDto } from './dto/review-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunitiesService } from './opportunities.service';

@Controller('opportunity')
@ApiTags('opportunity')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateOpportunityDto })
  @ApiOperation({ summary: 'Create a Opportunity' })
  async create(@Body() dto: CreateOpportunityDto, @Req() req: RequestWithUser) {
    return await this.opportunitiesService.createOpportunity(req, dto);
  }

  @Get('me/favorites-or-un-favorites/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get a Opportunity' })
  async updateFavoritesList(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.opportunitiesService.updateFavoritesList(req,id);
  }

  @Get('me/findOne-puplished/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get a Opportunity' })
  async getPublishedOpportunity(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.opportunitiesService.getPublishedOpportunity(req,id);
  }

  @Get('me/findOne-un-published/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiOperation({ summary: 'Get Unpublished Opportunity ' })
  async getUnPublishedOpportunity(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.opportunitiesService.getUnPublishedOpportunity(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateOpportunityDto })
  @ApiOperation({ summary: 'Update a Opportunity' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateOpportunityDto) {
    return await this.opportunitiesService.updateOpportunity(req,id, dto);
  }


  @Patch('/me/review-Opportunity/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: ReviewOpportunityDto })
  @ApiOperation({ summary: 'Review Opportunity - MNG' })
  async reviewOpportunity(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: ReviewOpportunityDto) {
    return await this.opportunitiesService.reviewOpportunity(req,id, dto);
  }

  @Patch('/me/publish-Opportunity/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: PublishOpportunityDto })
  @ApiOperation({ summary: 'Publish Opportunity - MNG' })
  async publishOpportunity(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: PublishOpportunityDto) {
    return await this.opportunitiesService.publishOpportunity(req,id, dto);
  }

  @Post('me/search-published-Opportunity')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all published Opportunity' })
  async searchPublishedOpportunity(@Req() req: RequestWithUser,@Body() options: OpportunitiesSearchOptions) : Promise<Pagination>{
    return await this.opportunitiesService.findAllPublished(req,options);
  }

  @Post('me/search-un-published-Opportunity')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all unpublished Opportunity - MNG+PRF' })
  async search(@Req() req: RequestWithUser,@Body() options: OpportunitiesSearchOptions) : Promise<Pagination>{
    return await this.opportunitiesService.findAllUnPublished(req,options);
  }


}