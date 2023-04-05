import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Outlets, OutletsSchema } from './entities/outlets.entity';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Outlets.name, schema: OutletsSchema },
        ]),
        SYSLogModule,
        UsersModule
    ],
    controllers: [OutletsController],
    providers: [OutletsService],
    exports: [OutletsService]
})
export class OutletsModule { }
