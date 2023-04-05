import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { CelebritiesSearchOptions } from './dto/celebrities-search-options.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';
import { CelebritiesService } from './celebrities.service';
import { ReviewCelebrityDto } from './dto/review-celebrity.dto';
import { PublishCelebrityDto } from './dto/publish-celebrity.dto';

@Controller('egyptian-char')
@ApiTags('egyptian-char')
export class CelebritiesController {
  constructor(
    private readonly celebritiesService: CelebritiesService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateCelebrityDto })
  @ApiOperation({ summary: 'Create Celebrity' })
  async create(@Body() dto: CreateCelebrityDto, @Req() req: RequestWithUser) {
    return await this.celebritiesService.createCelebrity(req, dto);
  }

  @Get('me/favorites-or-un-favorites/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get Celebrity' })
  async updateFavoritesList(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.celebritiesService.updateFavoritesList(req,id);
  }

  @Get('me/findOne-puplished/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get Celebrity' })
  async getPublishedCelebrity(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.celebritiesService.getPublishedCelebrity(req,id);
  }

  @Get('me/findOne-un-published/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiOperation({ summary: 'Get Unpublished Celebrity ' })
  async getUnPublishedCelebrity(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.celebritiesService.getUnPublishedCelebrity(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateCelebrityDto })
  @ApiOperation({ summary: 'Update Celebrity' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateCelebrityDto) {
    return await this.celebritiesService.updateCelebrity(req,id, dto);
  }


  @Patch('/me/review-celebrities/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: ReviewCelebrityDto })
  @ApiOperation({ summary: 'Review Celebrity - MNG' })
  async reviewCelebrity(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: ReviewCelebrityDto) {
    return await this.celebritiesService.reviewCelebrity(req,id, dto);
  }

  @Patch('/me/publish-celebrities/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: PublishCelebrityDto })
  @ApiOperation({ summary: 'Publish Celebrity - MNG' })
  async publishCelebrity(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: PublishCelebrityDto) {
    return await this.celebritiesService.publishCelebrity(req,id, dto);
  }

  @Post('me/search-published-celebrities')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all published Celebrity' })
  async searchPublishedCelebrity(@Req() req: RequestWithUser,@Body() options: CelebritiesSearchOptions) : Promise<Pagination>{
    return await this.celebritiesService.findAllPublished(req,options);
  }

  @Post('me/search-un-published-celebrities')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all unpublished Celebrity - MNG+PRF' })
  async search(@Req() req: RequestWithUser,@Body() options: CelebritiesSearchOptions) : Promise<Pagination>{
    return await this.celebritiesService.findAllUnPublished(req,options);
  }


}