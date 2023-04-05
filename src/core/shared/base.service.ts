import { Model, Document, Types } from 'mongoose';
import {
  InvalidIdException,
  RecordExistsException,
  RecordNotFoundException,
} from '../exceptions';
import { arrayToProjection, toPipelineStage } from '../utils';
import { Pagination } from './pagination.dto';
import { isEmpty } from 'lodash';
import * as moment from 'moment';
import { NotFoundException } from '@nestjs/common';
import { AnyARecord } from 'dns';

/**
 * Base CRUD service contains functions shared between all services.
 */
export class BaseService<T> {
  constructor(protected model: Model<any & Document>) {}

  /**
   * Validate id and return a valid bson ObjectId
   */
  public toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new InvalidIdException();
    }

    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  /**
   * Sort search results with one or more fields.
   */
  public sort(aggregation: any, sort: string, dir: string) {
    if (dir === 'asc') {
      aggregation.push({ $sort: { [sort]: 1 } });
    } else if (dir === 'desc') {
      aggregation.push({ $sort: { [sort]: -1 } });
    }
  }

  public customPeriod(aggregation, date1, date2) {
    aggregation.push(
      //change date to string & match
      {
        $addFields: {
          createdAtToString: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
      {
        $match: {createdAtToString: { $gte: date1, $lte: date2 },
        },
      },
      // {
      //   $project: {
      //     createdAtToString: 0,
      //   },
      // },
    );
  }
 
  /**
   * Filter search results.
   */
  public filter(
    aggregation: Record<string, any>[],
    filterBy: Record<string, any>[],
  ): void {
    const matchQry = [];
    for (const filter of filterBy) {
      if (!isEmpty(filter)) matchQry.push(toPipelineStage(filter));
    }

    if (matchQry.length) aggregation.push({ $match: { $and: matchQry } });
  }

  public filterByWarehouse(
    aggregation: Record<string, any>[],
    filterByWarehouse: Record<string, any>[],
  ): void {
    const matchQry = [];
    for (const filter of filterByWarehouse) {
      delete Object.assign(filter, {
        ['warehousestockitem.warehouseId']: filter['warehouseId'],
      })['warehouseId'];
      if (!isEmpty(filter)) matchQry.push(toPipelineStage(filter));
    }
    console.log(matchQry);
    if (matchQry.length) {
      aggregation.push(
        { $unwind: '$warehouseStockItemsData' },
        {
          $lookup: {
            from: 'warehousestockitems',
            localField: 'warehouseStockItemsData',
            foreignField: '_id',
            as: 'warehousestockitem',
          },
        },
        {
          $unwind: {
            path: '$warehousestockitem',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: { $and: matchQry },
        },
      );
    }
  }
  /**
   * Select only specific fields required by the user.
   */
  public project(
    aggregation: Record<string, any>[],
    attributes: string[],
  ): void {
    aggregation.push({ $project: arrayToProjection(attributes) });
  }

  /**
   * Skip a number of documents and apply a limit on the result.
   */
  public paginate(
    aggregation: Record<string, any>[],
    offset: number,
    size: number,
  ): void {
    aggregation.push({ $skip: offset }, { $limit: size });
  }

  /**
   * Returns true if at least one document exists in the database that matches the given filter.
   */
  public async exists(filter: any) {
    return await this.model.exists(filter);
  }

  /**
   * Returns the number of documents that match filter.
   */
  public async count(filter: any = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  /**
   * Creates a new document or documents.
   */
  async create(model: any, options?: {}): Promise<T> {
    try {
      const doc = await this.model.create(model);
      return doc as T;
    } catch (error) {
      if (error.code === 11000) {
        throw new RecordExistsException('010,R010');
      }
      throw error;
    }
  }

  /**
   * Send multiple write operation in the same command.
   */
  // async bulkWrite(writes: Record<string, any>[]){
  //   if (writes.length) {
  //     return this.model.bulkWrite(writes);
  //   }
  // }

  /**
   * Finds one document that matches the given filter.
   */
  async findOne(filter: any, projection: any = {}): Promise<T> {
    const doc = await this.model.findOne(filter, projection).exec();

    return doc as T;
  }

  /**
   * Finds one document that matches the given filter.
   * Throws error if not found.
   */
  async findOneAndErr(filter: any, projection: any = {}): Promise<T> {
    const doc = await this.model.findOne(filter, projection).exec();
    if (!doc) {
      throw new NotFoundException('002,R002');
    }

    return doc as T;
  }

  /**
   * Finds a single document by its _id field.
   */
  async findOneById(
    id: string | Types.ObjectId,
    projection: any = {},
  ): Promise<T> {
    const doc = await this.model
      .findById(this.toObjectId(id), projection)
      .exec();
    if (!doc) {
      throw new NotFoundException('002,R002');
    }

    return doc as T;
  }

  /**
   * Finds all documents that match the given filter.
   */
  async find(filter: any = {}, projection: any = {}): Promise<T[]> {
    const docs = await this.model.find(filter, projection).exec();
    return docs as unknown[] as T[];
  }

  /**
   * Updates a single document by its _id field.
   */
  async update(
    id: string | Types.ObjectId,
    updates: any,
    projection = {},
    options = {},
  ): Promise<T> {
    const doc = await this.model.findByIdAndUpdate(
      this.toObjectId(id),
      updates,
      {
        new: true,
        projection,
      },
    );
    if (!doc) {
      throw new NotFoundException('002,R002');
    }

    return doc as T;
  }

  /**
   * Updates a single document that match filter.
   */
  async updateOne(filter: any, updates: any, projection = {} , options?: {}): Promise<T> {
    const doc = await this.model.findOneAndUpdate(filter, updates, {
      new: true,
      projection,
    });
    if (!doc) {
      throw new NotFoundException('002,R002');
    }

    return doc as T;
  }

  /**
   * update all documents that match the given filter.
   */
  async updateMany(filter: any = {}, updates: any, projection: any = {}) {
    const docs = await this.model.updateMany(filter, updates, {
      new: true,
      projection,
    });
    return docs;
  }
  /**
   * Removes one document by id.
   */
  async remove(id: string | Types.ObjectId) {
    const doc = await this.model.findByIdAndDelete(this.toObjectId(id));
    if (!doc) {
      throw new NotFoundException('002,R002');
    }

    return true;
  }

  /**
   * Removes one document that match filter.
   */
  async removeOne(filter: any) {
    const doc = await this.model.findOneAndDelete(filter);
    if (!doc) {
      throw new NotFoundException('002,R002');
    }

    return true;
  }

  /**
   * Aggregate a collection to retrieve multiple documents.
   */
  async aggregate(
    aggregation: any[],
    offset: number,
    size: number,
  ): Promise<Pagination> {
    aggregation.push(
      {
        $group: {
          _id: null,
          content: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          content: { $slice: ['$content', offset, size] },
          count: 1,
          _id: 0,
        },
      },
    );

    const data = await this.model.aggregate(aggregation);

    return new Pagination(data[0]);
  }

  /**
   * Aggregates a collection to retrieve one document.
   */
  async aggregateOne(aggregation: any[]): Promise<T> {
    const data = await this.model.aggregate(aggregation);
    return data[0] as unknown as T;
  }
}
