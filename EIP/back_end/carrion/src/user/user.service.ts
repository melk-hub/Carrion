import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const normalizedEmail = createUserDto.email.toLowerCase();
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          email: normalizedEmail,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
      throw error;
    }
  }

  async findByIdentifier(identifier: string, isEmail: boolean) {
    if (isEmail) {
      const normalizedIdentifier = identifier.toLowerCase();
      return await this.prisma.user.findUnique({
        where: { email: normalizedIdentifier },
      });
    }
    return await this.prisma.user.findUnique({
      where: { username: identifier },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        hashedRefreshToken: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.email) {
        updateUserDto.email = updateUserDto.email.toLowerCase();
      }
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });

      Logger.warn(
        `User with id ${id} and all related data have been deleted successfully.`,
      );

      return deletedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw error;
    }
  }

  async addDocument(userId: string, newDocument: string) {
    if (!userId || !newDocument) {
      throw new BadRequestException('User ID and document name are required');
    }

    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      let userSettings = await this.prisma.settings.findUnique({
        where: { userId: userId },
        select: { document: true, id: true },
      });

      if (!userSettings) {
        userSettings = await this.prisma.settings.create({
          data: {
            userId: userId,
            document: [newDocument],
          },
          select: { document: true, id: true },
        });
        return userSettings;
      }

      if (userSettings.document.includes(newDocument)) {
        throw new ConflictException(
          `Document ${newDocument} already exists for this user`,
        );
      }

      const updatedDocuments = [...userSettings.document, newDocument];

      return await this.prisma.settings.update({
        where: { userId: userId },
        data: { document: updatedDocuments },
        select: { document: true, id: true },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error.code === 'P2025') {
        throw new NotFoundException(`Settings not found for user ${userId}`);
      }

      throw new BadRequestException(`Failed to add document: ${error.message}`);
    }
  }
}
