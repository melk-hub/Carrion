import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async addUserFullName(firstName: string, lastName: string) {
    // const user = await this.prisma.user.create({
    //   data: {
    //     email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@test.com`,
    //     username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    //   },
    // });
    // return user;
  }
}
