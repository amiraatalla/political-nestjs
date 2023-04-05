import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { News, NewsSchema } from './entities/news.entity';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: News.name, schema: NewsSchema },
        ]),
        SYSLogModule,
        UsersModule,
    ],
    controllers: [NewsController],
    providers: [NewsService],
    exports: [NewsService]
})
export class NewsModule { }
