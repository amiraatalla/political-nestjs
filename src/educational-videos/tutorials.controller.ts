import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { PublishTutorialDto } from './dto/publish-tutorial.dto';
import { ReviewTutorialDto } from './dto/review-tutorial.dto';
import { TutorialsSearchOptions } from './dto/tutorials-search-options.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { TutorialsService } from './tutorials.service';

@Controller('educational-videos')
@ApiTags('educational-videos')
export class TutorialsController {
  constructor(
    private readonly tutorialsService: TutorialsService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateTutorialDto })
  @ApiOperation({ summary: 'Create Tutorial' })
  async create(@Body() dto: CreateTutorialDto, @Req() req: RequestWithUser) {
    return await this.tutorialsService.createTutorial(req, dto);
  }

  @Get('me/favorites-or-un-favorites/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get Tutorials' })
  async updateFavoritesList(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.tutorialsService.updateFavoritesList(req,id);
  }

  @Get('me/findOne-puplished/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get Tutorials' })
  async getPublishedTutorials(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.tutorialsService.getPublishedTutorial(req,id);
  }

  @Get('me/findOne-un-published/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiOperation({ summary: 'Get Unpublished Tutorials ' })
  async getUnPublishedTutorials(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.tutorialsService.getUnPublishedTutorial(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateTutorialDto })
  @ApiOperation({ summary: 'Update Tutorials' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateTutorialDto) {
    return await this.tutorialsService.updateTutorial(req,id, dto);
  }


  @Patch('/me/review-tutorial/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: ReviewTutorialDto })
  @ApiOperation({ summary: 'Review Tutorials - MNG' })
  async reviewTutorials(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: ReviewTutorialDto) {
    return await this.tutorialsService.reviewTutorial(req,id, dto);
  }

  @Patch('/me/publish-tutorial/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: PublishTutorialDto })
  @ApiOperation({ summary: 'Publish Tutorials - MNG' })
  async publishTutorials(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: PublishTutorialDto) {
    return await this.tutorialsService.publishTutorial(req,id, dto);
  }

  @Post('me/search-published-tutorial')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all published Tutorials' })
  async searchPublishedTutorials(@Req() req: RequestWithUser,@Body() options: TutorialsSearchOptions) : Promise<Pagination>{
    return await this.tutorialsService.findAllPublished(req,options);
  }

  @Post('me/search-un-published-tutorial')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all unpublished Tutorials - MNG+PRF' })
  async search(@Req() req: RequestWithUser,@Body() options: TutorialsSearchOptions) : Promise<Pagination>{
    return await this.tutorialsService.findAllUnPublished(req,options);
  }


}