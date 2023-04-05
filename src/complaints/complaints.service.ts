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
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintsSearchOptions } from './dto/complaints-search-options.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Complaint, ComplaintDoc } from './entities/complaint.entity';
import { HandleComplaintDto } from './dto/handle-complaint.dto';
import { ReviewComplaintDto } from './dto/review-complaint.dto';
import { FeedbackComplaintDto } from './dto/feedback-complaint.dto copy';

@Injectable()
export class ComplaintsService extends BaseService<ComplaintDoc> {
  constructor(
    @InjectModel(Complaint.name) readonly m: Model<ComplaintDoc>,
    private readonly sysLogsService: SYSLogService,
    private readonly usersService: UsersService,

  ) {
    super(m);
  }

  async createComplaint(req: RequestWithUser, dto: CreateComplaintDto) {

    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_COMPLAINT,
    });
    const result = await this.create({
      complainantId: req.user._id,
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
          localField: 'complainantId',
          foreignField: '_id',
         as : 'complainant'
        }
      },
      
      {
        $project: {
          'complaint.password': 0,
        },
      }
    );
    return await this.aggregateOne(aggregation);
  }

 
  async getHandledComplaint(req: RequestWithUser, id: string) {
    const Complaint = await this.findOne({ _id: this.toObjectId(id), isHandled: true, isReviewd: true });
    if (!Complaint) throw new NotFoundException('029,R029');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_COMPLAINT,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Complaint._id) }
      },
      
      {
        $lookup: {
          from: 'users',
          localField: 'complainantId',
          foreignField: '_id',
         as : 'complainant'
        }
      },
      
      {
        $project: {
          'complaint.password': 0,
        },
      }
    );
    return await this.aggregateOne(aggregation);

  }

  async getUnHandledComplaint(req: RequestWithUser, id: string) {
    const Complaint = await this.findOne({ _id: this.toObjectId(id), isHandled: false, isReviewd: false });
    if (!Complaint) throw new NotFoundException('029,R029');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_COMPLAINT,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(Complaint._id) }
      },

      {
        $lookup: {
          from: 'users',
          localField: 'complainantId',
          foreignField: '_id',
         as : 'complainant'
        }
      },
      {
        $project: {
          'complaint.password': 0,
        },
      }
    );
    return await this.aggregateOne(aggregation);

  }

  async reviewComplaint(req: RequestWithUser, id: string, dto: ReviewComplaintDto) {
    const ComplaintExist = await this.findOne({      
      _id: this.toObjectId(id),
      isHandled: false
    });
    if (!ComplaintExist) throw new NotFoundException('029,R029');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_COMPLAINT,
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
            localField: 'complainantId',
            foreignField: '_id',
           as : 'complainant'
          }
        },
        
        {
          $project: {
            'complaint.password': 0,
          },
        }
      );
      return await this.aggregateOne(aggregation);
    }
  }

  async handleComplaint(req: RequestWithUser, id: string, dto: HandleComplaintDto) {
    const ComplaintExist = await this.findOne({
      
      _id: this.toObjectId(id),
      isReviewd: true
    });
    if (!ComplaintExist) throw new NotFoundException('029,R029');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_COMPLAINT,
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
            localField: 'complainantId',
            foreignField: '_id',
           as : 'complainant'
          }
        },
        
        {
          $project: {
            'complaint.password': 0,
          },
        }
      );
      return await this.aggregateOne(aggregation);
    }
  }

  async updateComplaint(req: RequestWithUser, id: string, dto: UpdateComplaintDto) {
    const ComplaintExist = await this.findOne({
      
      _id: this.toObjectId(id),
    });
    if (!ComplaintExist) throw new NotFoundException('029,R029');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_COMPLAINT,
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
            localField: 'complainantId',
            foreignField: '_id',
           as : 'complainant'
          }
        },
        
        {
          $project: {
            'complaint.password': 0,
          },
        }
      );
      return await this.aggregateOne(aggregation);
    }
  }

  async replyComplaint(req: RequestWithUser, id: string, dto: FeedbackComplaintDto) {
    const ComplaintExist = await this.findOne({
      _id: this.toObjectId(id),
    });
    if (!ComplaintExist) throw new NotFoundException('029,R029');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_COMPLAINT,
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
            localField: 'complainantId',
            foreignField: '_id',
           as : 'complainant'
          }
        },
        
        {
          $project: {
            'complaint.password': 0,
          },
        }
      );
      return await this.aggregateOne(aggregation);
    }
  }

  /**
   * Search Complaints collection.
   */
  async findAllHandled(
    req: RequestWithUser,
    options: ComplaintsSearchOptions,
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
      { $match: { isHandled: { $eq: true }, isReviewd: { $eq: true } } },
      {
        $lookup: {
          from: 'users',
          localField: 'complainantId',
          foreignField: '_id',
         as : 'complainant'
        }
      },
      
      {
        $project: {
          'complaint.password': 0,
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
  async findAllUnHandled(
    req: RequestWithUser,
    options: ComplaintsSearchOptions,
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
      { $match: { isHandled: { $eq: false }, isReviewd: { $eq: false } } },

      {
        $lookup: {
          from: 'users',
          localField: 'complainantId',
          foreignField: '_id',
         as : 'complainant'
        }
      },
      
      {
        $project: {
          'complaint.password': 0,
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
   * Search Complaints fields.
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
 