const mongoose = require('mongoose');
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
import { CreateNewsDto } from './dto/create-news.dto';
import { NewsSearchOptions } from './dto/news-search-options.dto';
import { PublishNewsDto } from './dto/publish-news.dto';
import { ReviewNewsDto } from './dto/review-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News, NewsDoc } from './entities/news.entity';

@Injectable()
export class NewsService extends BaseService<NewsDoc> {
  constructor(
    @InjectModel(News.name) readonly m: Model<NewsDoc>,
    private readonly sysLogsService: SYSLogService,
    private readonly usersService: UsersService,

  ) {
    super(m);
  }

  async createNews(req: RequestWithUser, dto: CreateNewsDto) {

    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_NEWS,
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
      _id: this.toObjectId(id), isPublished: true, isReviewd: true
    });
    if (!NewsExist) throw new NotFoundException('020,R020');
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
        action: ActionsEnum.UPDATE_NEWS,
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


  async getPublishedNews(req: RequestWithUser, id: string) {
    const news = await this.findOne({ _id: this.toObjectId(id), isPublished: true, isReviewd: true });
    if (!news) throw new NotFoundException('020,R020');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_NEWS,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(news._id) }
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

  async getUnPublishedNews(req: RequestWithUser, id: string) {
    const news = await this.findOne({ _id: this.toObjectId(id), isPublished: false, isReviewd: false });
    if (!news) throw new NotFoundException('020,R020');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_NEWS,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(news._id) }
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

  async reviewNews(req: RequestWithUser, id: string, dto: ReviewNewsDto) {
    const NewsExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isPublished: false
    });
    if (!NewsExist) throw new NotFoundException('020,R020');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_NEWS,
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

  async publishNews(req: RequestWithUser, id: string, dto: PublishNewsDto) {
    const NewsExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isReviewd: true
    });
    if (!NewsExist) throw new NotFoundException('020,R020');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_NEWS,
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

  async updateNews(req: RequestWithUser, id: string, dto: UpdateNewsDto) {
    const NewsExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
    });
    if (!NewsExist) throw new NotFoundException('020,R020');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_NEWS,
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
   * Search Newss collection.
   */
  async findAllPublished(
    req: RequestWithUser,
    options: NewsSearchOptions,
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
    options: NewsSearchOptions,
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
   * Search Newss fields.
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
