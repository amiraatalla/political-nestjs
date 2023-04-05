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
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { OpportunitiesSearchOptions } from './dto/opportunities-search-options.dto';
import { PublishOpportunityDto } from './dto/publish-opportunity.dto';
import { ReviewOpportunityDto } from './dto/review-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { Opportunity, OpportunityDoc } from './entities/opportunity.entity';

@Injectable()
export class OpportunitiesService extends BaseService<OpportunityDoc> {
  constructor(
    @InjectModel(Opportunity.name) readonly m: Model<OpportunityDoc>,
    private readonly sysLogsService: SYSLogService,
    private readonly usersService: UsersService,

  ) {
    super(m);
  }

  async createOpportunity(req: RequestWithUser, dto: CreateOpportunityDto) {

    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_OPPORTUNITY,
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
    const OpportunityExist = await this.findOne({
      _id: this.toObjectId(id), isPublished: true, isReviewd: true
    });
    if (!OpportunityExist) throw new NotFoundException('028,R028');
    else {
      const index = OpportunityExist.favorites.indexOf(req.user._id);
      if (!OpportunityExist.favorites.includes(req.user._id)) {
        OpportunityExist.favorites.push(req.user._id);
      }
      else {
        OpportunityExist.favorites.splice(index, 1);
      }
      const result = await OpportunityExist.save();
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_OPPORTUNITY,
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


  async getPublishedOpportunity(req: RequestWithUser, id: string) {
    const Opportunity = await this.findOne({ _id: this.toObjectId(id), isPublished: true, isReviewd: true });
    if (!Opportunity) throw new NotFoundException('028,R028');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_OPPORTUNITY,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Opportunity._id) }
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

  async getUnPublishedOpportunity(req: RequestWithUser, id: string) {
    const Opportunity = await this.findOne({ _id: this.toObjectId(id), isPublished: false, isReviewd: false });
    if (!Opportunity) throw new NotFoundException('028,R028');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_OPPORTUNITY,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Opportunity._id) }
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

  async reviewOpportunity(req: RequestWithUser, id: string, dto: ReviewOpportunityDto) {
    const OpportunityExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isPublished: false
    });
    if (!OpportunityExist) throw new NotFoundException('028,R028');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_OPPORTUNITY,
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

  async publishOpportunity(req: RequestWithUser, id: string, dto: PublishOpportunityDto) {
    const OpportunityExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
      isReviewd: true
    });
    if (!OpportunityExist) throw new NotFoundException('028,R028');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_OPPORTUNITY,
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

  async updateOpportunity(req: RequestWithUser, id: string, dto: UpdateOpportunityDto) {
    const OpportunityExist = await this.findOne({
      newspaperId: req.user.newspaperId,
      _id: this.toObjectId(id),
    });
    if (!OpportunityExist) throw new NotFoundException('028,R028');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_OPPORTUNITY,
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
   * Search Opportunitys collection.
   */
  async findAllPublished(
    req: RequestWithUser,
    options: OpportunitiesSearchOptions,
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
    options: OpportunitiesSearchOptions,
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
   * Search Opportunitys fields.
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
 