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
import { CreateOutletDto } from './dto/create-outlet.dto';
import { OutletsSearchOptions } from './dto/outlets-search-options.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { Outlets, OutletsDoc } from './entities/outlets.entity';

@Injectable()
export class OutletsService extends BaseService<OutletsDoc> {
  constructor(
    @InjectModel(Outlets.name) readonly m: Model<OutletsDoc>,
    private readonly sysLogsService: SYSLogService,

    private readonly usersService: UsersService,
  ) {
    super(m);
  }

  async createOutlets(req: RequestWithUser, dto: CreateOutletDto) {
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_OUTLETS,
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

  async updateFavoritesList(req: RequestWithUser, id: string) {
    const NewsExist = await this.findOne({
      _id: this.toObjectId(id)
    });
    if (!NewsExist) throw new NotFoundException('030,R030');
    else {
      const index = NewsExist.favorites.indexOf(req.user._id);
      if (!NewsExist.favorites.includes(req.user._id)) {
        NewsExist.favorites.push(req.user._id);
      }
      else {
        NewsExist.favorites.splice(index, 1);
      }
      const result = await NewsExist.save();
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_OUTLETS,
      });

      let aggregation = [];
      aggregation.push(
        {
          $match: { _id: this.toObjectId(result._id) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'favorites',
            foreignField: '_id',
            as: 'favoritesList'
          }
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

  async findOutlets(req: RequestWithUser, id: string) {
    const Outlets = await this.findOneById(id);
    if (!Outlets) throw new NotFoundException('030,R030');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_OUTLETS,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Outlets._id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'favorites',
          foreignField: '_id',
          as: 'favoritesList'
        }
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
   * Edit Outletss collection.
   */

  async updateOutlets(req: RequestWithUser, id: string, dto: UpdateOutletDto) {
    const OutletsExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
    });
    if (!OutletsExist) throw new NotFoundException('030,R030');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_OUTLETS,
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
            localField: 'favorites',
            foreignField: '_id',
            as: 'favoritesList'
          }
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
   * Search Outletss collection.
   */
  async findAll(
    req: RequestWithUser,
    options: OutletsSearchOptions,
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
          localField: 'favorites',
          foreignField: '_id',
          as: 'favoritesList'
        }
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
   * Search Outletss fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ name: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }
}
