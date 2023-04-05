import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from 'src/categories/category.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UsersModule } from 'src/users/users.module';
import { Opportunity, OpportunitySchema } from './entities/opportunity.entity';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Opportunity.name, schema: OpportunitySchema },
        ]),
        SYSLogModule,
        UsersModule,
        CategoryModule
    ],
    controllers: [OpportunitiesController],
    providers: [OpportunitiesService],
    exports: [OpportunitiesService]
})
export class OpportunitiesModule { }
