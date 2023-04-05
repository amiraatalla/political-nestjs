import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { UsersService } from 'src/users/users.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategorySearchOptions } from './dto/category-search-options.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDoc } from './entities/category.entity';

@Injectable()
export class CategoryService extends BaseService<CategoryDoc> {
  constructor(
    @InjectModel(Category.name) readonly m: Model<CategoryDoc>,
    private readonly sysLogsService: SYSLogService,

    private readonly usersService: UsersService,
  ) {
    super(m);
  }

  async createCategory(req: RequestWithUser, dto: CreateCategoryDto) {

    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_CATEGORY,
    });
    const result = await this.create({
      newspaperId: req.user.newspaperId,
      editorId: req.user._id,
      ...dto,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(result._id) }

      },
      {
        $lookup: {
          from: 'users',
          localField: 'editorId',
          foreignField: '_id',
          as: 'editor'
        }
      },
      {
        $lookup: {
          from: 'newspapers',
          localField: 'newspaperId',
          foreignField: '_id',
          as: 'newspaper'
        }
      },
      {
        $project: {
          'editor.password': 0,
        },
      }
    );
    return await this.aggregateOne(aggregation);
  }

  /**
   * Edit Categorys collection.
   */

  async findCategory(req: RequestWithUser, id: string) {
    const category = await this.findOneById(id);
    if (!category) throw new NotFoundException('024,R024');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CATEGORY,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(category._id) }

      },
      {
        $lookup: {
          from: 'users',
          localField: 'editorId',
          foreignField: '_id',
          as: 'editor'
        }
      },
      {
        $lookup: {
          from: 'newspapers',
          localField: 'newspaperId',
          foreignField: '_id',
          as: 'newspaper'
        }
      },
      {
        $project: {
          'editor.password': 0,
        },
      }
    );
    return await this.aggregateOne(aggregation);
  }

  /**
   * Edit Categorys collection.
   */

  async updateCategory(req: RequestWithUser, id: string, dto: UpdateCategoryDto) {
    const CategoryExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
    });
    if (!CategoryExist) throw new NotFoundException('024,R024');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_CATEGORY,
      });
      const result = await this.update(id, {
        ...dto,
      });
      let aggregation = [];
      aggregation.push(
        {
          $match: { _id: this.toObjectId(result._id) }

        },
        {
          $lookup: {
            from: 'users',
            localField: 'editorId',
            foreignField: '_id',
            as: 'editor'
          }
        },
        {
          $lookup: {
            from: 'newspapers',
            localField: 'newspaperId',
            foreignField: '_id',
            as: 'newspaper'
          }
        },
        {
          $project: {
            'editor.password': 0,
          },
        }
      );
      return await this.aggregateOne(aggregation);
    }

  }

  /**
   * Search Categorys collection.
   */
  async findAll(
    req: RequestWithUser,
    options: CategorySearchOptions,
  ): Promise<Pagination> {
    const aggregation = [];

    const {
      dir,
      offset,
      size,
      searchTerm,
      filterBy,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options;

    const sort = 'index';

    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }
    aggregation.push(
      {
        $lookup: {
          from: 'users',
          localField: 'editorId',
          foreignField: '_id',
          as: 'editor'
        }
      },
      {
        $lookup: {
          from: 'newspapers',
          localField: 'newspaperId',
          foreignField: '_id',
          as: 'newspaper'
        }
      },
      {
        $project: {
          'editor.password': 0,
        },
      }
      );
    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }
    return await this.aggregate(aggregation, offset, size);
  }

  /**
   * Search Categorys fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ name: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }
}
