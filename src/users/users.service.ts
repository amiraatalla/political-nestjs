import {
  BadRequestException,
  forwardRef,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { BaseService, Pagination } from 'src/core/shared';
import { UserDoc, User } from './entities/user.entity';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import {
  EmailTakenException,
  RecordNotFoundException,
} from 'src/core/exceptions';
import { EmailRequest } from 'libs/mail/src';
import { ConfigService } from 'src/config/config.service';
import { EmailToken, EmailTokenDoc } from './entities/email-token.entity';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/auth/dto';
import { isStillValid, toObjectId } from 'src/core/utils';
import { UserSearchOptions } from './dto/user-search-options.dto';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { TokenService } from './token.service';
import { MailService } from '@political/mail';
import { TokenType } from './enums/token-type.enum';
import { ChangeEmailDto } from './dto/change-email.dto';
import { EmailDto } from './dto/email.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDeviceTokenDto } from './dto/update-user-device-token.dto';
import { RequestWithUser } from 'src/core/interfaces';
import { RolesEnum } from './enums/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeactiveUserDto } from './dto/deactive-user.dto';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcryptjs';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class UsersService extends BaseService<UserDoc> {
  constructor(
    @InjectModel(User.name) readonly m: Model<UserDoc>,
    @InjectModel(EmailToken.name) readonly emailToken: Model<EmailToken>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly sysLogsService: SYSLogService,
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

  ) {
    super(m);
  }


  async me(req: RequestWithUser): Promise<User> {
    const user = await (await this.findOneById(req.user._id, { password: 0 }));
    if (!user) throw new NotFoundException('015,R015');
    return user;
  }

  async myUser(req: RequestWithUser, id: string) {
    const user = await this.findOne(
      { _id: toObjectId(id), managerId: req.user._id },
      { password: 0 },
    );
    if (!user) throw new NotFoundException('015,R015');
    return user;
  }

  async myUsers(req: RequestWithUser) {
    return await this.find({ managerId: req.user._id }, { password: 0 });
  }

  private async checkMyPhone(req, dto, user) {
    let checkPhone;
    if (dto.phoneNumber !== user.phoneNumber) {
      checkPhone = await this.findOne({ phoneNumber: dto.phoneNumber, _id: { $ne: req.user._id } }, { password: 0 });
      return checkPhone;
    }
  }
  async updateMe(req: RequestWithUser, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(req.user._id, { password: 0 });
    if (!user) throw new NotFoundException('015,R015');
    console.log("user", user);

    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_USER,
    });
    let checkPhone;
    checkPhone = await this.checkMyPhone(req, dto, user.phoneNumber);
    if (!checkPhone) {
      const updatedData = await this.update(req.user._id, dto, { password: 0 });
      if (updatedData) return updatedData;
      else throw new BadRequestException("016,R016")
    } else throw new BadRequestException("017,R017");
  }

  async updateMyUser(req: RequestWithUser, id: string, dto: UpdateUserDto) {
    const user = await this.findOne(
      { _id: toObjectId(id), managerId: req.user._id },
      { password: 0 },
    );
    console.log(user);

    if (!user) throw new NotFoundException('015,R015');
    else {
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_USER,
      });

      let checkPhone;
      checkPhone = await this.checkMyPhone(req, dto, user.phoneNumber);

      if (!checkPhone) {
        const updatedData = await this.update(id, dto, { password: 0 });
        if (updatedData) return updatedData;
        else throw new BadRequestException("016,R016")
      } else throw new BadRequestException("017,R017");
    }
  }


  /**
   * Creates a new unique user with email and a password.
   * @param signUpDto
   */
  async createWithPassword(signUpDto: CreateUserDto) {
    const exists =
      await this.findOne({ $or: [{ email: { $eq: signUpDto.email } }, { phoneNumber: { $eq: signUpDto.phoneNumber } }] });
    if (exists) {
      throw new BadRequestException('001,R001');
    }

    const user = await this.create(signUpDto);
    if (!user) throw new BadRequestException("018,R018");
    //create logs
    console.log("user", user);

    await this.sysLogsService.create({
      userId: user._id,
      action: ActionsEnum.CREATE_USER,
    });


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, pin, ...data } = user.toJSON();
    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_VERIFICATION_TOKEN });

    const token = tokenData.code;


    // Send verification email
    this.mailService.sendSignUpMail(user.email, token);
    console.log("email", (await this.mailService.sendSignUpMail(user.email, token)).status);

    return data as User;
  }

  /**
   * send re-verify user  email
   */
  async sendReverifyEmail(emailDto: EmailDto) {
    //find user
    const user = await this.findOne({
      email: emailDto.email,
    });

    if (!user) {
      throw new RecordNotFoundException('002,R002');
    }

    if (user.emailVerified == true) throw new BadRequestException('011,R011');

    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_REVERIFICATION_TOKEN });
    const token = tokenData.code;

    //Send verification email
    return this.mailService.sendReVerifyMail(user.email, token);
  }

  /**
   * Creates a new random code and email it to the user.
   * @param {ForgetPasswordDto} dto
   */
  async sendResetPasswordEmail(emailDto: ForgetPasswordDto) {
    //find user
    const user = await this.findOne({
      email: emailDto.email,
    });

    if (!user) {
      throw new RecordNotFoundException('002,R002');
    }

    if (user.emailVerified != true) throw new BadRequestException('019,R019');

    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_REVERIFICATION_TOKEN });
    const token = tokenData.code;


    //Send verification email
    return this.mailService.sendForgotPasswordMail(user.email, token);
  }

  /**
   * users change email
   */
  async userChangeEmail(dto: ChangeEmailDto) {
    const { email, userId } = dto;

    //Find user
    const user = await this.findOneById(userId);
    if (!user) throw new BadRequestException('001,R001');

    //Check email availability
    const exist = await this.findOne({ email });
    if (exist) throw new BadRequestException('001,R001');

    //Update user with the new email
    await user.updateOne({ email, emailVerified: false });
    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_VERIFICATION_TOKEN });

    const token = `${this.configService.appUrl}/auth/verify?code=${tokenData.code}`;

    // Send verification email
    this.mailService.sendSignUpMail(user.email, token);

    return 'email was changed, please check your mail for verification link';
  }

  /**
   * Update user's password.
   * @param {ResetPasswordDto} resetPasswordDto
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.verifyCode(resetPasswordDto.code);
    user.password = resetPasswordDto.newPassword;
    await user.save();

    return true;
  }

  /**
   * Verifies the code coming from the user in case of email verification.
   * @param {String} code
   */
  async verifyEmailToken(code: string) {
    const token = await this.emailToken.findOne({ code });
    if (token) {
      const user = await this.findOneById(token.userId);
      if (isStillValid(token.createdAt)) {
        await token.deleteOne();
        const entity = new User(user.toJSON());
        console.log("user", user._id);
        return await this.update(user._id, { emailVerified: true });
      } else {
        await token.deleteOne();
        throw new GoneException('token is failed');
      }
    }

    throw new UnauthorizedException('003,R003');
  }

  /**
   * Verifies the code coming from the user is valid and not expired.
   * @param {String} code
   */
  async verifyCode(code: string) {
    const token = await this.emailToken.findOne({ code });
    if (token) {
      if (isStillValid(token.createdAt)) {
        await token.deleteOne();
        return await this.findOneById(token.userId);
      } else {
        await token.deleteOne();
        throw new GoneException();
      }
    }

    throw new UnauthorizedException('003,R003');
  }

  async findMyActiveUsers(
    options: UserSearchOptions,
    req: RequestWithUser,
  ): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;

    const sort = 'index';


    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }
    aggregation.push({
      $match: {
        $and: [{ managerId: { $eq: req.user._id } },
        { active: { $eq: true } }
        ],
      },
    });

    aggregation.push(
      {
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $project: {
          password: 0,
        },
      }
    );

    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }
    return await this.aggregate(aggregation, offset, size);
  }
  async findMyDeActiveUsers(
    options: UserSearchOptions,
    req: RequestWithUser,
  ): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;

    const sort = 'index';

    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }
    aggregation.push({
      $match: {
        $and: [{ managerId: { $eq: req.user._id } },
        { active: { $eq: false } }
        ],
      },
    });

    aggregation.push(
      {
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $project: {
          password: 0,
        },
      }
    );

    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }
    return await this.aggregate(aggregation, offset, size);

    // let contentList = [];
    // let countList = 0;
    // for (const data in result.content) {
    //   if (result.content[data].active == false) {
    //     contentList.push(result.content[data]);
    //     countList += 1;
    //   }
    // }
    // return { "count": countList, "content": contentList };
  }

  /**
   * Search users collection.
   */
  async findAll(options: UserSearchOptions): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;

    aggregation.push(
      {
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
    )

    const sort = 'index';

    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }

    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }

    aggregation.push({
      $project: {
        password: 0,

      },
    });

    return await this.aggregate(aggregation, offset, size);
  }


  /**
    * Search Business managerIds collection.
    */
  async findAllBusinessmanagerIds(options: UserSearchOptions): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;

    const sort = 'index';



    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }

    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        {
          $lookup: {
            from: 'users',
            localField: 'managerId',
            foreignField: '_id',
            as: 'manager'
          }
        },
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }

    aggregation.push({
      $project: {
        password: 0,

      },
    });

    const result = await this.aggregate(aggregation, offset, size);
    return result;
  }
  /**
   * Search users fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          { name: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { email: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { role: { $regex: new RegExp(searchTerm), $options: 'i' } },

        ],
      },
    });
  }

  /**
   * update user device token
   */
  async updateUserDeviceToken(id: string, dto: UpdateUserDeviceTokenDto) {
    //check if device token assign to another user
    const userDeviceToken: any = await this.findOne({
      devicesToken: dto.deviceToken,
    });
    // //if device token assign to another user
    if (userDeviceToken) {
      //remove from another user data
      await this.updateOne(
        { _id: this.toObjectId(userDeviceToken._id) },
        { $pull: { devicesToken: dto.deviceToken } },
      );
      //set to current user
      return await this.update(
        id,
        { $addToSet: { devicesToken: dto.deviceToken } },
        { devicesToken: 0, password: 0 },
      );
    } else {
      //  set device token to user
      return await this.update(
        id,
        { $addToSet: { devicesToken: dto.deviceToken } },
        { devicesToken: 0, password: 0 },
      );
    }

  }

  async deactiveUser(req: RequestWithUser, id: string, dto: DeactiveUserDto) {
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_USER,
    });

    const userIds = [];
    const user = await this.findOneById(toObjectId(id), { password: 0 });
    const myUsers = await this.find({ managerId: toObjectId(id) }, { password: 0 });
    console.log('user', user, 'myUsers', myUsers);

    if (!user) throw new NotFoundException('015,R015');
    else {
      if (myUsers) {
        myUsers.forEach(async (e) => userIds.push(e._id));
      }
      console.log('ids', userIds);

      if (userIds) {
        await this.updateMany({ _id: { $in: userIds } }, dto, { password: 0 });
      }
      const updatedUser = await this.update(id, dto, { password: 0 });
      return updatedUser;
    }
  }

  async deactiveMyUser(req: RequestWithUser, id: string, dto: DeactiveUserDto) {

    const user = await this.findOne({ _id: toObjectId(id), managerId: req.user._id }, { password: 0 });
    console.log('user', user);
    if (!user) throw new NotFoundException('015,R015');
    const updatedUser = await this.update(id, dto, { password: 0 });
    await this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_USER,
    });
    return updatedUser;
  }

  async createProfile(
    req: RequestWithUser,
    dto: CreateProfileDto,
  ) {

    const exist =
      await this.findOne({ $or: [{ email: { $eq: dto.email } }, { phoneNumber: { $eq: dto.phoneNumber } }] });
    if (exist) {
      throw new BadRequestException('001,R001');
    }
    if(!req.user.newspaperId) throw new BadRequestException("023,R023");
    const user = await this.create({
      managerId: req.user._id,
      newspaperId:req.user.newspaperId,
      emailVerified: true,
      active: true,
      ...dto,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = user.toJSON();

    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(user._id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $lookup: {
          from: 'newspapers',
          localField: 'newspaperId',
          foreignField: '_id',
          as: 'newspaper'
        }
      }
    );
    const result = await this.aggregateOne(aggregation);

    this.authService.addJwtToCookie(req);
    return { accessToken: req.cookies.session.jwt, user: result }
  }

}
