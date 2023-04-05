import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FireBaseService {
  constructor(private readonly usersService: UsersService) { }
  /*
  * send notification with firebase
  */
  async sendNotification(dto: CreateNotificationDto) {
    let ids = [];
    if (dto.allReaders == true) {
      const user = await this.usersService.find({ role: RolesEnum.READER });
      for (const userId in user) {
        ids.push(user[userId]._id);
        console.log("user-f", user[userId].role);
      }
    }
    console.log("ids-f", ids);

    if (dto.allBusiness == true) {
      const user = await this.usersService.find({ $or: [{ role: RoleGroups.NEWSPAPER }] });

      for (const userId in user) {
        ids.push(user[userId]._id);
        console.log("user-m", user[userId].role);
      }
    }
    console.log("ids-m", ids);

    if (dto.userIds.length>0) {
      for (const userId in dto.userIds) {
        ids.push(dto.userIds[userId]);
        console.log("user-l", ids);
      }
    }

    console.log("ids-l", ids);
    let count = 0;
    for (const userId of ids) {
      count += 1;
      console.log(count, " : ", userId);

      const user = await this.usersService.findOneById(userId);
      console.log("inside", userId, "iu", user);
      let successIds = [];
      if (user?.devicesToken?.length > 0) {
        successIds.push(user._id);
       if (dto.notificationData.imageUrl) {
        try
        { 
        const message = {
            notification: {
              title: dto.notificationData.title,
              body: dto.notificationData.body,
              imageUrl: dto?.notificationData?.imageUrl,
            },

            android: {
              ttl: 3600 * 1000,
              notification: {
                imageUrl: dto.notificationData.imageUrl,
              },
            },
            apns: {
              payload: {
                aps: {
                  badge: 42,
                },
              },
            },
            tokens: user.devicesToken,
          };

          const notificationStatus = await admin
            .messaging()
            .sendMulticast(message);
          return { notificationStatus, userId };
        
        }catch(error){
          throw new BadRequestException("014,R014");
        }
      } else {
          const message = {
            notification: {
              title: dto.notificationData.title,
              body: dto.notificationData.body,
            },

            android: {
              ttl: 3600 * 1000,
              notification: {
                icon: 'stock_ticker_update',
                color: '#D01C23',
              },
            },
            apns: {
              payload: {
                aps: {
                  badge: 42,
                },
              },
            },
            tokens: user.devicesToken,
          };

          const notificationStatus = await admin
            .messaging()
            .sendMulticast(message);
          return { notificationStatus, successIds  };
        }
      }
    }
  }

  async sendAlertNotification(
    id,
    warehouseName: string,
    stockitemName: string,
    reOrderPoint: number,
    qtyOnHand: number,
    qtyToOrder: number,
  ) {
    const user = await this.usersService.findOneById(
      this.usersService.toObjectId(id),
    );
    if (user?.devicesToken?.length > 0) {
      const body = `A shortage in ${warehouseName}.
      It reached the re-order point of ${reOrderPoint} and the quantity to order is ${qtyToOrder}`;
      const message = {
        notification: {
          title: stockitemName,
          body: body,
        },
      };
      const notificationStatus = await admin
        .messaging()
        .sendToDevice(user.devicesToken, message);
      console.log(notificationStatus);
      return { notificationStatus, id };
    }
  }
  async sendExpiryNotification(
    id,
    warehouseName: string,
    stockItemName: string,
    qtyToExpire: number,
  ) {
    const user = await this.usersService.findOneById(
      this.usersService.toObjectId(id),
    );
    if (user?.devicesToken?.length > 0) {
      const body = `The ${stockItemName} in ${warehouseName} warehouse has a quantity of ${qtyToExpire} about to expire.`;
      const message = {
        notification: {
          title: `Stock item ${stockItemName} about to expire`,
          body: body,
        },
        android: {
          ttl: 3600 * 1000,
          notification: {
            icon: 'stock_ticker_update',
            color: '#D01C23',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 42,
            },
          },
        },
        tokens: user.devicesToken,
      };

      const notificationStatus = await admin.messaging().sendMulticast(message);
      return { notificationStatus, id };
    }
  }
}
