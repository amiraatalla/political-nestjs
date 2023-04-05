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
import { CreateNewspaperDto } from './dto/create-newspaper.dto';
import { NewspaperSearchOptions } from './dto/newspaper-search-options.dto';
import { UpdateNewspaperDto } from './dto/update-newspaper.dto';
import { Newspaper, NewspaperDoc } from './entities/newspaper.entity';

@Injectable()
export class NewspaperService extends BaseService<NewspaperDoc> {
  constructor(
    @InjectModel(Newspaper.name) readonly m: Model<NewspaperDoc>,
    private readonly sysLogsService: SYSLogService,

    private readonly usersService: UsersService,
  ) {
    super(m);
  }

  async createNewspaper(req: RequestWithUser, dto: CreateNewspaperDto) {
    const session = await this.m.startSession();
    let newspaper
    try {
      await session.withTransaction(async (): Promise<any> => {
        newspaper = await this.create({
          managerId: req.user._id,
          ...dto,
        },
          { session: session });
      });
      console.log("newspaper", newspaper);

      const updatedUser = await this.usersService.update(req.user._id, { newspaperId: newspaper._id }, {}, { session: session });
      console.log("updatedUser", updatedUser);

      await session.commitTransaction();
      await await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.CREATE_NEWSPAPER,
      });
      await await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_USER,
      });
      let aggregation = [];
      aggregation.push(
        {
          $match:
            { _id: this.toObjectId(newspaper._id) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'managerId',
            foreignField: '_id',
            as: 'manager'
          }
        },
        {
          $project: {
            'manager.password': 0,
            'manager.newspaperId': 0,
          },
        }

      );
      const result = await this.aggregateOne(aggregation);
      return result;
    } catch (err) {
      return { "message": "022,R022" };
    }
    finally {
      session.endSession();
    }
  }


  /**
   * Edit Newspapers collection.
   */

  async findNewspaper(req: RequestWithUser, id: string) {
    const newspaper = await this.findOne({ _id: this.toObjectId(id) });
    if (!newspaper) throw new NotFoundException('021,R021');
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_NEWSPAPER,
    });
    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(newspaper._id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $project: {
          'manager.password': 0,
          'manager.newspaperId': 0,
        },
      }

    );
    const result = await this.aggregateOne(aggregation);
    return result;

  }

  /**
   * Edit Newspapers collection.
   */

  async updateNewspaper(req: RequestWithUser, id: string, dto: UpdateNewspaperDto) {
    const newspaperExist = await this.findOne({ _id: this.toObjectId(id), magagerId: req.user._id });
    if (!newspaperExist) throw new NotFoundException('021,R021');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_NEWSPAPER,
      });
      const updatedNewspaper = await this.update(id, {
        ...dto,
      });
      let aggregation = [];
      aggregation.push(
        {
          $match:
            { _id: this.toObjectId(updatedNewspaper._id) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'managerId',
            foreignField: '_id',
            as: 'manager'
          }
        },
        {
          $project: {
            'manager.password': 0,
            'manager.newspaperId': 0,
          },
        }
      );
      const result = await this.aggregateOne(aggregation);
      return result;

    }
  }

  /**
   * Search Newspapers collection.
   */
  async findAll(
    req: RequestWithUser,
    options: NewspaperSearchOptions,
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
    aggregation.push({
      $lookup: {
        from: 'users',
        localField: 'managerId',
        foreignField: '_id',
        as: 'manager'
      }
    }, {
      $project: {
        'manager.password': 0,
        'manager.newspaperId': 0,
      },
    });
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
   * Search Newspapers fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ name: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }
}
