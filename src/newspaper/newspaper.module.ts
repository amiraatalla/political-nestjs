import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Newspaper, NewspaperSchema } from './entities/newspaper.entity';
import { NewspaperController } from './newspaper.controller';
import { NewspaperService } from './newspaper.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Newspaper.name, schema: NewspaperSchema },
        ]),
        SYSLogModule,
        UsersModule
    ],
    controllers: [NewspaperController],
    providers: [NewspaperService],
    exports: [NewspaperService]
})
export class NewspaperModule { }
