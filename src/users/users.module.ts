import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from 'libs/mail/src';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from 'src/config/config.module';
import { EmailToken, EmailTokenSchema } from './entities/email-token.entity';
import { User, UserSchema } from './entities/user.entity';
import { TokenService } from './token.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: EmailToken.name, schema: EmailTokenSchema },
        ]),       
        forwardRef(() =>AuthModule),
        ConfigModule.Deferred,
        MailModule.Deferred,
    ],
    controllers: [UsersController,],
    providers: [UsersService, TokenService],
    exports: [UsersService, TokenService]
})
export class UsersModule {

}
