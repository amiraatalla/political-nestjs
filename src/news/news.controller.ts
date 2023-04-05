import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsSearchOptions } from './dto/news-search-options.dto';
import { PublishNewsDto } from './dto/publish-news.dto';
import { ReviewNewsDto } from './dto/review-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';

@Controller('news')
@ApiTags('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateNewsDto })
  @ApiOperation({ summary: 'Create News' })
  async create(@Body() dto: CreateNewsDto, @Req() req: RequestWithUser) {
    return await this.newsService.createNews(req, dto);
  }

  @Get('me/favorites-or-un-favorites/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'favorites or unfavorites news' })
  async updateFavoritesList(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.newsService.updateFavoritesList(req,id);
  }

  @Get('me/findOne-puplished/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get News' })
  async getPublishedNews(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.newsService.getPublishedNews(req,id);
  }

  @Get('me/findOne-un-published/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiOperation({ summary: 'Get Unpublished News ' })
  async getUnPublishedNews(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.newsService.getUnPublishedNews(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateNewsDto })
  @ApiOperation({ summary: 'Update News' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateNewsDto) {
    return await this.newsService.updateNews(req,id, dto);
  }


  @Patch('/me/review-news/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: ReviewNewsDto })
  @ApiOperation({ summary: 'Review News - MNG' })
  async reviewNews(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: ReviewNewsDto) {
    return await this.newsService.reviewNews(req,id, dto);
  }

  @Patch('/me/publish-news/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: PublishNewsDto })
  @ApiOperation({ summary: 'Publish News - MNG' })
  async publishNews(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: PublishNewsDto) {
    return await this.newsService.publishNews(req,id, dto);
  }

  @Post('me/search-published-news')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all published News' })
  async searchPublishedNews(@Req() req: RequestWithUser,@Body() options: NewsSearchOptions) : Promise<Pagination>{
    return await this.newsService.findAllPublished(req,options);
  }

  @Post('me/search-un-published-news')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all unpublished News - MNG+PRF' })
  async search(@Req() req: RequestWithUser,@Body() options: NewsSearchOptions) : Promise<Pagination>{
    return await this.newsService.findAllUnPublished(req,options);
  }


}