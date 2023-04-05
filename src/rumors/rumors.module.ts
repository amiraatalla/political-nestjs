import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Rumors, RumorsSchema } from './entities/rumors.entity';
import { RumorsController } from './rumors.controller';
import { RumorsService } from './rumors.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Rumors.name, schema: RumorsSchema },
        ]),
        SYSLogModule,
        UsersModule
    ],
    controllers: [RumorsController],
    providers: [RumorsService],
    exports: [RumorsService]
})
export class RumorsModule { }
