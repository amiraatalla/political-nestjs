import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Celebrities, CelebritiesSchema } from './entities/celebrities.entity';
import { CelebritiesController } from './celebrities.controller';
import { CelebritiesService } from './celebrities.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Celebrities.name, schema: CelebritiesSchema },
        ]),
        SYSLogModule,
        UsersModule
    ],
    controllers: [CelebritiesController],
    providers: [CelebritiesService],
    exports: [CelebritiesService]
})
export class CelebritiesModule { }
