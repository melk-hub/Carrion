import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationRole } from '@prisma/client';
import {
  ChangeMemberRoleDTO,
  CreateOrganizationInvitationDTO,
  GetInformationOrganizationDTO,
  KickMemberFromOrganizationDTO,
} from './dto/organization.dto';
import { randomBytes } from 'crypto';

const roleWithRights = ['OWNER', 'TEACHER'];

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getUserOrganization(userId: string) {
    const data = await this.prisma.organizationMember.findFirst({
      where: { userId },
    });
    return data;
  }

  async joinOrganization(userId: string, body: GetInformationOrganizationDTO) {
    try {
      await this.prisma.organizationMember.create({
        data: {
          userId,
          organizationId: body.organizationId,
          userRole: body.role as unknown as OrganizationRole, // Potentiellement a fix c'est l'erreur de mon IDE qui me demande de faire ça :/
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

  async getOrganizationInformation(
    userId: string,
    body: GetInformationOrganizationDTO,
  ) {
    const organizationInfo = await this.prisma.organization.findUnique({
      where: { id: body.organizationId },
      select: {
        id: true,
        name: true,
        user: {
          select: {
            id: true,
            email: true,
            userProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const membersList = await this.prisma.organizationMember.findMany({
      where: { organizationId: body.organizationId },
      select: {
        id: true,
        userRole: true,
        user: {
          select: {
            id: true,
            email: true,
            userProfile: { select: { firstName: true, lastName: true } },
            _count: {
              select: { jobApplies: true, archivedJobApplies: true },
            },
          },
        },
      },
    });

    const orgTotalJobApply = membersList.reduce(
      (acc, cur) =>
        (acc +=
          cur.user._count.archivedJobApplies + cur.user._count.jobApplies),
      0,
    );

    return {
      organization: organizationInfo,
      members: membersList,
      totalJobApply: orgTotalJobApply,
    };
  }

  async editMemberRole(body: ChangeMemberRoleDTO) {
    try {
      if (
        (body.role as unknown as string) !== OrganizationRole.STUDENT &&
        (body.role as unknown as string) !== OrganizationRole.TEACHER
      ) {
        throw new ForbiddenException(
          'You can only choose between STUDENT and TEACHER',
        );
      }

      await this.prisma.organizationMember.update({
        where: {
          userId_organizationId: {
            userId: body.memberId,
            organizationId: body.organizationId,
          },
        },
        data: { userRole: body.role as unknown },
      });

      return {
        statusCode: 200,
        message: 'User role edited successfully',
      };
    } catch (error) {
      if (error.code) {
        throw new InternalServerErrorException(
          "An error occurred while trying to edit this user's role",
        );
      }
      if (error.response.statusCode === 403) {
        throw new ForbiddenException(error.response.message);
      }
      if (error.response.statusCode === 404) {
        throw new NotFoundException(error.response.message);
      }
    }
  }

  async kickMemberFromOrganization(
    userId: string,
    body: KickMemberFromOrganizationDTO,
  ) {
    try {
      const kickedUser = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: body.memberId,
            organizationId: body.organizationId,
          },
        },
        select: {
          userRole: true,
        },
      });

      if (!kickedUser || !kickedUser.userRole) {
        throw new NotFoundException(
          "The user being kicked doesn't exist in this organization",
        );
      }

      if (kickedUser.userRole === OrganizationRole.OWNER) {
        throw new ForbiddenException(
          "You can't kick another OWNER from the organization, please contact Carrion for more information.",
        );
      }

      await this.prisma.organizationMember.delete({
        where: {
          userId_organizationId: {
            userId: body.memberId,
            organizationId: body.organizationId,
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Member kicked successfully',
      };
    } catch (error) {
      if (error.code) {
        throw new InternalServerErrorException(
          'An error occurred while trying to kick this member',
        );
      }
      if (error.response.statusCode === 403) {
        throw new ForbiddenException(error.response.message);
      }
      if (error.response.statusCode === 404) {
        throw new NotFoundException(error.response.message);
      }
    }
  }

  async getOrganizationSettingsData(userId: string, body: any) {

  }

  async changeOrganizationOwner(userId: string, body: any) {

  }

  async revokeOrganizationInvitation(userId: string, body: any) {

  }
}
