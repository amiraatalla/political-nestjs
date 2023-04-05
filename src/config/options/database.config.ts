import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '../config.service';

mongoose.set('debug', true);

@Injectable()
export class MongooseModuleConfig implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.databaseUrl,
    };
  }
}