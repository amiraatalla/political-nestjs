const mongoose = require('mongoose');
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { CategoryService } from 'src/categories/category.service';
import { BaseService, Pagination } from 'src/core/shared';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { UsersService } from 'src/users/users.service';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { PublishTutorialDto } from './dto/publish-tutorial.dto';
import { ReviewTutorialDto } from './dto/review-tutorial.dto';
import { TutorialsSearchOptions } from './dto/tutorials-search-options.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { Tutorials, TutorialsDoc } from './entities/tutorials.entity';

@Injectable()
export class TutorialsService extends BaseService<TutorialsDoc> {
  constructor(
    @InjectModel(Tutorials.name) readonly m: Model<TutorialsDoc>,
    private readonly sysLogsService: SYSLogService,
    private readonly usersService: UsersService,
  ) {
    super(m);
  }

  async createTutorial(req: RequestWithUser, dto: CreateTutorialDto) {

    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_TUTORIAL,
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
    const TutorialExist = await this.findOne({
      _id: this.toObjectId(id), isPublished: true, isReviewd: true  
    });
    if (!TutorialExist) throw new NotFoundException('026,R026');
    else {
      const index = TutorialExist.favorites.indexOf(req.user._id);
      if (!TutorialExist.favorites.includes(req.user._id)) {
        TutorialExist.favorites.push(req.user._id);
      }
      else {
        TutorialExist.favorites.splice(index,1);
      }
      const result = await TutorialExist.save();
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_TUTORIAL,
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


  async getPublishedTutorial(req: RequestWithUser, id: string) {
    const Tutorial = await this.findOne({ _id: this.toObjectId(id), isPublished: true, isReviewd: true });
    if (!Tutorial) throw new NotFoundException('026,R026');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_TUTORIAL,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Tutorial._id) }
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

  async getUnPublishedTutorial(req: RequestWithUser, id: string) {
    const Tutorial = await this.findOne({ _id: this.toObjectId(id), isPublished: false, isReviewd: false });
    if (!Tutorial) throw new NotFoundException('026,R026');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_TUTORIAL,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Tutorial._id) }
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

  async reviewTutorial(req: RequestWithUser, id: string, dto: ReviewTutorialDto) {
    const TutorialExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isPublished: false
    });
    if (!TutorialExist) throw new NotFoundException('026,R026');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_TUTORIAL,
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

  async publishTutorial(req: RequestWithUser, id: string, dto: PublishTutorialDto) {
    const TutorialExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isReviewd: true
    });
    if (!TutorialExist) throw new NotFoundException('026,R026');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_TUTORIAL,
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

  async updateTutorial(req: RequestWithUser, id: string, dto: UpdateTutorialDto) {
    const TutorialExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
    });
    if (!TutorialExist) throw new NotFoundException('026,R026');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_TUTORIAL,
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
   * Search Tutorials collection.
   */
  async findAllPublished(
    req: RequestWithUser,
    options: TutorialsSearchOptions,
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
    options: TutorialsSearchOptions,
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
   * Search Tutorials fields.
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
