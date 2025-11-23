import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationRole } from '@prisma/client';
import {
  CreateOrganizationInvitationDTO,
  JoinOrganizationDTO,
} from './dto/organization.dto';
import { randomBytes } from 'crypto';

const roleWithRights = ['OWNER', 'TEACHER'];

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getUserOrganization(userId: string) {
    return await this.prisma.organizationMember.findMany({
      where: { userId },
    });
  }

  async joinOrganization(userId: string, body: JoinOrganizationDTO) {
    try {
      await this.prisma.organizationMember.create({
        data: {
          userId,
          organizationId: body.organizationId,
          userRole: body.userRole as unknown as OrganizationRole, // TODO Potentiellement a fix c'est l'erreur de mon IDE qui me demande de faire ça :/
        },
      });

      return {
        status: 201,
        message: 'User added to organization successfully.',
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'This user already exist in this organization',
        );
      }
      throw new InternalServerErrorException(
        'Unknown error unable to process with the request',
      );
    }
  }

  async sendInvitationToOrganization(
    userId: string,
    body: CreateOrganizationInvitationDTO,
  ) {
    try {
      const requesterInfo = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: body.organizationId,
          },
        },
      });

      if (!requesterInfo) {
        throw new ForbiddenException("You aren't part of this organization");
      }

      if (!roleWithRights.includes(requesterInfo.userRole)) {
        throw new ForbiddenException(
          "You don't have the rights to invite someone",
        );
      }

      if (
        requesterInfo.userRole === 'TEACHER' &&
        (body.role as unknown as string) !== 'STUDENT'
      ) {
        throw new ForbiddenException(
          "Your role doesn't have enough rights to do that.",
        );
      }

      const token = randomBytes(32).toString('hex');

      await this.prisma.organizationInvitation.create({
        data: {
          token: token,
          email: body.email,
          organizationId: body.organizationId,
          inviterUserId: userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          role:
            (body.role as unknown as OrganizationRole) ||
            OrganizationRole.STUDENT,
        },
      });

      // TODO Envoyer un mail du coup avec un lien
      return {
        status: 201,
        message: 'Invitation sent successfully.',
      };
    } catch (error) {
      if (error.code == 'P2002') {
        throw new ConflictException('This user already received an invitation');
      }
      if (error.response.statusCode == 403) {
        throw new ForbiddenException(error.response.message);
      }
      throw new InternalServerErrorException(
        'Unknown error unable to process with the invitation of this user',
      );
    }
  }
}
