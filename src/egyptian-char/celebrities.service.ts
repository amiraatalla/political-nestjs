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
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { CelebritiesSearchOptions } from './dto/celebrities-search-options.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';
import { Celebrities, CelebritiesDoc } from './entities/celebrities.entity';
import { ReviewCelebrityDto } from './dto/review-celebrity.dto';
import { PublishCelebrityDto } from './dto/publish-celebrity.dto';

@Injectable()
export class CelebritiesService extends BaseService<CelebritiesDoc> {
  constructor(
    @InjectModel(Celebrities.name) readonly m: Model<CelebritiesDoc>,
    private readonly sysLogsService: SYSLogService,

    private readonly usersService: UsersService,
  ) {
    super(m);
  }

  async createCelebrity(req: RequestWithUser, dto: CreateCelebrityDto) {

    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_CELEBRITIES,
    });
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CATEGORY,
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
    const CelebrityExist = await this.findOne({
      _id: this.toObjectId(id), isPublished: true, isReviewd: true
    });
    if (!CelebrityExist) throw new NotFoundException('026,R026');
    else {
      const index = CelebrityExist.favorites.indexOf(req.user._id);
      if (!CelebrityExist.favorites.includes(req.user._id)) {
        CelebrityExist.favorites.push(req.user._id);
      }
      else {
        CelebrityExist.favorites.splice(index, 1);
      }
      const result = await CelebrityExist.save();
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_CELEBRITIES,
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


  async getPublishedCelebrity(req: RequestWithUser, id: string) {
    const Celebrity = await this.findOne({ _id: this.toObjectId(id), isPublished: true, isReviewd: true });
    if (!Celebrity) throw new NotFoundException('026,R026');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CELEBRITIES,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Celebrity._id) }
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

  async getUnPublishedCelebrity(req: RequestWithUser, id: string) {
    const Celebrity = await this.findOne({ _id: this.toObjectId(id), isPublished: false, isReviewd: false });
    if (!Celebrity) throw new NotFoundException('026,R026');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CELEBRITIES,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Celebrity._id) }
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

  async reviewCelebrity(req: RequestWithUser, id: string, dto: ReviewCelebrityDto) {
    const CelebrityExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isPublished: false
    });
    if (!CelebrityExist) throw new NotFoundException('026,R026');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_CELEBRITIES,
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

  async publishCelebrity(req: RequestWithUser, id: string, dto: PublishCelebrityDto) {
    const CelebrityExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isReviewd: true
    });
    if (!CelebrityExist) throw new NotFoundException('026,R026');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_CELEBRITIES,
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

  async updateCelebrity(req: RequestWithUser, id: string, dto: UpdateCelebrityDto) {
    const CelebrityExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
    });
    if (!CelebrityExist) throw new NotFoundException('026,R026');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_CELEBRITIES,
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
   * Search Celebritys collection.
   */
  async findAllPublished(
    req: RequestWithUser,
    options: CelebritiesSearchOptions,
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
      { $match: { isPublished: { $eq: true }, isReviewd: { $eq: true } } },
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
  async findAllUnPublished(
    req: RequestWithUser,
    options: CelebritiesSearchOptions,
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
      { $match: { isPublished: { $eq: false }, isReviewd: { $eq: false } } },

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
   * Search Celebritys fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          { title: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { category: { $regex: new RegExp(searchTerm), $options: 'i' } }
        ],
      },
    });
  }
}