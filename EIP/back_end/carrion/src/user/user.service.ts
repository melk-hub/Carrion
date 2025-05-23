import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const formattedDate = createUserDto.birthDate
      ? new Date(createUserDto.birthDate).toISOString()
      : null;
    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        birthDate: formattedDate,
      },
    });
  }

  async findByIdentifier(identifier: string, isEmail: boolean) {
    return await this.prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        hashedRefreshToken: true,
        role: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateHistoryIdOfUser(userId: string, newHistoryId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }
      return await this.prisma.user.update({
        where: { id: userId },
        data: { historyId: newHistoryId.toString() },
      });
    } catch (error) {
      console.error('Error updating historyId:', error);
    }
  }
}
