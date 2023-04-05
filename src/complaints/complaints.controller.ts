import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintsSearchOptions } from './dto/complaints-search-options.dto';
import { HandleComplaintDto } from './dto/handle-complaint.dto';
import { ReviewComplaintDto } from './dto/review-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { ComplaintsService } from './complaints.service';
import { FeedbackComplaintDto } from './dto/feedback-complaint.dto copy';

@Controller('complaint')
@ApiTags('complaint')
export class ComplaintsController {
  constructor(
    private readonly complaintsService: ComplaintsService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateComplaintDto })
  @ApiOperation({ summary: 'Create a Complaint' })
  async create(@Body() dto: CreateComplaintDto, @Req() req: RequestWithUser) {
    return await this.complaintsService.createComplaint(req, dto);
  }

 

  @Get('me/findOne-handled/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a Complaint' })
  async getHandledComplaint(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.complaintsService.getHandledComplaint(req,id);
  }

  @Get('me/findOne-un-Handled/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiOperation({ summary: 'Get UnHandled Complaint ' })
  async getUnHandledComplaint(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.complaintsService.getUnHandledComplaint(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateComplaintDto })
  @ApiOperation({ summary: 'Update a Complaint' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateComplaintDto) {
    return await this.complaintsService.updateComplaint(req,id, dto);
  }

  @Patch('/me/review-Complaint/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: ReviewComplaintDto })
  @ApiOperation({ summary: 'Review Complaint - MNG' })
  async reviewComplaint(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: ReviewComplaintDto) {
    return await this.complaintsService.reviewComplaint(req,id, dto);
  }



  @Patch('/me/reply/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: FeedbackComplaintDto })
  @ApiOperation({ summary: 'reply Complaint' })
  async replyComplaint(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: FeedbackComplaintDto) {
    return await this.complaintsService.replyComplaint(req,id, dto);
  }

  @Patch('/me/Handle-Complaint/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER_MANAGER)
  @ApiBody({ type: HandleComplaintDto })
  @ApiOperation({ summary: 'Handle Complaint - MNG' })
  async HandleComplaint(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: HandleComplaintDto) {
    return await this.complaintsService.handleComplaint(req,id, dto);
  }

  @Post('me/search-handled-complaint')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Handled Complaint' })
  async searchHandledComplaint(@Req() req: RequestWithUser,@Body() options: ComplaintsSearchOptions) : Promise<Pagination>{
    return await this.complaintsService.findAllHandled(req,options);
  }

  @Post('me/search-un-handled-complaint')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all unHandled Complaint - MNG+PRF' })
  async search(@Req() req: RequestWithUser,@Body() options: ComplaintsSearchOptions) : Promise<Pagination>{
    return await this.complaintsService.findAllUnHandled(req,options);
  }


}