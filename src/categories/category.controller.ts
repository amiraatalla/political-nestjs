import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategorySearchOptions } from './dto/category-search-options.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: CreateCategoryDto })
  @ApiOperation({ summary: 'Create a Category - MNG+PRF' })
  async create(@Body() dto: CreateCategoryDto, @Req() req: RequestWithUser) {
    return await this.categoryService.createCategory(req, dto);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get a Category - any' })
  async getCategory(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.categoryService.findCategory(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.NEWSPAPER)
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOperation({ summary: 'Update a Category - MNG+PRF' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateCategoryDto) {
    return await this.categoryService.updateCategory(req,id, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Category - any' })
  async search(@Req() req: RequestWithUser,@Body() options: CategorySearchOptions) : Promise<Pagination>{
    return await this.categoryService.findAll(req,options);
  }


}