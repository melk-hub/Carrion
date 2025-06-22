import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
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
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
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
    return await this.prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
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
      return await this.prisma.user.delete({
        where: { id },
      });
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
      // Check if user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      // Search user settings by UserId
      let userSettings = await this.prisma.settings.findUnique({
        where: { UserId: userId },
        select: { document: true, id: true },
      });

      // If the user does not have any settings yet, create them
      if (!userSettings) {
        userSettings = await this.prisma.settings.create({
          data: {
            UserId: userId,
            document: [newDocument],
          },
          select: { document: true, id: true },
        });
        return userSettings;
      }

      // Check if document already exists to avoid duplicates
      if (userSettings.document.includes(newDocument)) {
        throw new ConflictException(
          `Document ${newDocument} already exists for this user`,
        );
      }

      // Add new document to existing list
      const updatedDocuments = [...userSettings.document, newDocument];

      return await this.prisma.settings.update({
        where: { UserId: userId },
        data: { document: updatedDocuments },
        select: { document: true, id: true },
      });
    } catch (error) {
      // Re-throw NestJS exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      // Handle Prisma errors
      if (error.code === 'P2025') {
        throw new NotFoundException(`Settings not found for user ${userId}`);
      }
      // Generic error
      throw new BadRequestException(`Failed to add document: ${error.message}`);
    }
  }
}
