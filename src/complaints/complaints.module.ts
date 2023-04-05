import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from 'src/categories/category.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Complaint, ComplaintSchema } from './entities/complaint.entity';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Complaint.name, schema: ComplaintSchema },
        ]),
        SYSLogModule,
        UsersModule,
    ],
    controllers: [ComplaintsController],
    providers: [ComplaintsService],
    exports: [ComplaintsService]
})
export class ComplaintsModule { }
