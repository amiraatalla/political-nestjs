import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { ConfigModuleConfig } from './config/options/config.config';
import { MongooseModuleConfig } from './config/options/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from 'libs/mail/src';
import { MailModuleConfig } from './config/options/mail.config';
import { SYSLogModule } from './sysLog/sysLog.module';
import { NotificationModule } from './notification/notification.module';
import { UploadModule } from './upload/upload.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NewspaperModule } from './newspaper/newspaper.module';
import { CategoryModule } from './categories/category.module';
import { NewsModule } from './news/news.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { TutorialsModule } from './educational-videos/tutorials.module';
import { CelebritiesModule } from './egyptian-char/celebrities.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { RumorsModule } from './rumors/rumors.module';
import { OutletsModule } from './outlets-directory/outlets.module';

@Module({
  imports: [
    ConfigModule.forRootAsync(ConfigModule, { useClass: ConfigModuleConfig }),
    MongooseModule.forRootAsync({
      useClass: MongooseModuleConfig,
      imports: [ConfigModule.Deferred],
    }),
    MailModule.forRootAsync(MailModule, {
      useClass: MailModuleConfig,
      imports: [ConfigModule.Deferred],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    SYSLogModule,
    NotificationModule,
    UploadModule,
    NewspaperModule,
    CategoryModule,
    NewsModule,
    ObjectivesModule,
    TutorialsModule,
    CelebritiesModule,
    OpportunitiesModule,
    ComplaintsModule,
    RumorsModule,
    OutletsModule,
  ],

 

 
 
 
})
export class AppModule { }
