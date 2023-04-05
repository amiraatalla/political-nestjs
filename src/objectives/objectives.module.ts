import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from 'src/categories/category.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Objectives, ObjectivesSchema } from './entities/objectives.entity';
import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Objectives.name, schema: ObjectivesSchema },
        ]),
        SYSLogModule,
        UsersModule,
        CategoryModule
    ],
    controllers: [ObjectivesController],
    providers: [ObjectivesService],
    exports: [ObjectivesService]
})
export class ObjectivesModule { }
