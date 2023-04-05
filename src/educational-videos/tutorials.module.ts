import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Tutorials, TutorialsSchema } from './entities/tutorials.entity';
import { TutorialsController } from './tutorials.controller';
import { TutorialsService } from './tutorials.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Tutorials.name, schema: TutorialsSchema },
        ]),
        SYSLogModule,
        UsersModule
    ],
    controllers: [TutorialsController],
    providers: [TutorialsService],
    exports: [TutorialsService]
})
export class TutorialsModule { }
