import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const formattedDate = createUserDto.birthDate
      ? new Date(createUserDto.birthDate).toISOString()
      : null;
    console.log(formattedDate);
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

  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        token: true,
        role: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
