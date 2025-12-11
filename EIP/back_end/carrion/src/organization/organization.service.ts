import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationRole } from '@prisma/client';
import {
  ChangeMemberRoleDTO,
  ChangeOrganizationOwnerDTO,
  CreateOrganizationInvitationDTO,
  EditInvitationRoleDTO,
  GetInformationOrganizationDTO,
  JoinOrganizationDTO,
  KickMemberFromOrganizationDTO,
  LeaveOrganizationDTO,
  RevokeOrganizationInvitationDTO,
} from './dto/organization.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) { }

  async getUserOrganization(userId: string) {
    try {
      const data = await this.prisma.organizationMember.findFirst({
        where: { userId },
      });
      return data;
    } catch {
      return null;
    }
  }

  async joinOrganization(userId: string, body: JoinOrganizationDTO) {
    try {
      await this.prisma.organizationMember.create({
        data: {
          userId,
          organizationId: body.organizationId,
          userRole: body.role as unknown as OrganizationRole,
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
      const requester = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: body.organizationId,
          },
        },
        select: { userRole: true },
      });

      if (!requester) throw new ForbiddenException('Member not found');

      if (
        requester.userRole === OrganizationRole.TEACHER &&
        (body.role as unknown as string) !== OrganizationRole.STUDENT
      ) {
        throw new ForbiddenException('Teachers can only invite Students.');
      }

      const token = randomBytes(32).toString('hex');

      await this.prisma.organizationInvitation.create({
        data: {
          token: token,
          email: body.email,
          organizationId: body.organizationId,
          inviterUserId: userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          role: body.role as unknown as OrganizationRole,
        },
      });

      return { status: 201, message: 'Invitation sent successfully.' };
    } catch (error) {
      if (error.code == 'P2002')
        throw new ConflictException('This user already received an invitation');
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Error sending invitation');
    }
  }

  async getOrganizationInformation(body: GetInformationOrganizationDTO) {
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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

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
            jobApplies: {
              where: { createdAt: { gte: oneWeekAgo } },
              select: { id: true },
            },
            archivedJobApplies: {
              where: { archivedAt: { gte: oneWeekAgo } },
              select: { id: true },
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

  async kickMemberFromOrganization(body: KickMemberFromOrganizationDTO) {
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

  async getOrganizationSettingsData(organizationId: string) {
    try {
      const invitationList = await this.prisma.organizationInvitation.findMany({
        where: { organizationId },
        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          inviter: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      const memberList = await this.prisma.organizationMember.findMany({
        where: { organizationId },
        select: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      return {
        invitationList: invitationList,
        memberList: memberList,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Error occurred while trying to get data from organization's settings",
      );
    }
  }

  async changeOrganizationOwner(
    userId: string,
    body: ChangeOrganizationOwnerDTO,
  ) {
    try {
      const updateUser1 = this.prisma.organizationMember.update({
        where: {
          userId_organizationId: {
            userId,
            organizationId: body.organizationId,
          },
        },
        data: { userRole: 'TEACHER' },
      });

      const updateUser2 = this.prisma.organizationMember.update({
        where: {
          userId_organizationId: {
            userId: body.newOwnerId,
            organizationId: body.organizationId,
          },
        },
        data: { userRole: 'OWNER' },
      });

      const updateOrg = this.prisma.organization.update({
        where: {
          id: body.organizationId,
        },
        data: {
          ownerUserId: body.newOwnerId,
        },
      });

      await this.prisma.$transaction([updateUser1, updateUser2, updateOrg]);
      return {
        statusCode: 200,
        message: "The organization's owner has been changed successfully",
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error occurred while trying to change the organization owner',
      );
    }
  }

  async editInvitationRole(userId: string, body: EditInvitationRoleDTO) {
    try {
      const requester = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: body.organizationId,
          },
        },
        select: { userRole: true },
      });

      if (requester?.userRole !== OrganizationRole.OWNER) {
        throw new ForbiddenException('Only Owners can edit invitation roles.');
      }

      await this.prisma.organizationInvitation.update({
        where: { id: body.invitationId, organizationId: body.organizationId },
        data: { role: body.role as unknown as OrganizationRole },
      });

      return {
        statusCode: 200,
        message: 'Invitation role updated successfully',
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Error editing invitation role');
    }
  }

  async revokeOrganizationInvitation(
    userId: string,
    body: RevokeOrganizationInvitationDTO,
  ) {
    try {
      const invitation = await this.prisma.organizationInvitation.findUnique({
        where: { id: body.invitationId, organizationId: body.organizationId },
        select: { role: true },
      });

      if (!invitation) throw new NotFoundException('Invitation not found');

      const requester = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: body.organizationId,
          },
        },
        select: { userRole: true },
      });

      if (!requester) throw new ForbiddenException('Requester not found');

      if (
        requester.userRole === OrganizationRole.TEACHER &&
        invitation.role !== OrganizationRole.STUDENT
      ) {
        throw new ForbiddenException(
          'Teachers can only revoke Student invitations.',
        );
      }

      await this.prisma.organizationInvitation.delete({
        where: { id: body.invitationId },
      });

      return {
        statusCode: 200,
        message: 'The invitation has been deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException(
        `Error occurred while trying to delete invitation: ${body.organizationId}`,
      );
    }
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: { select: { name: true } },
        inviter: {
          select: {
            email: true,
            userProfile: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!invitation) throw new NotFoundException("Invitation introuvable ou invalide.");
    if (new Date() > invitation.expiresAt) throw new BadRequestException("Cette invitation a expiré.");

    console.log("invitation trouvée");
    return invitation;
  }

  async acceptInvitation(userId: string, token: string) {
    return await this.prisma.$transaction(async (tx) => {
      const invitation = await tx.organizationInvitation.findUnique({
        where: { token },
      });

      if (!invitation) throw new NotFoundException("Invitation invalide.");
      if (new Date() > invitation.expiresAt) throw new BadRequestException("Invitation expirée.");

      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new ForbiddenException(
          `Cette invitation est réservée à l'adresse ${invitation.email}. Vous êtes connecté avec ${user?.email}.`
        );
      }

      const existingMember = await tx.organizationMember.findUnique({
        where: { userId_organizationId: { userId, organizationId: invitation.organizationId } }
      });

      if (existingMember) {
        await tx.organizationInvitation.delete({ where: { id: invitation.id } });
        return { status: 200, message: "Vous êtes déjà membre de cette organisation." };
      }

      await tx.organizationMember.create({
        data: {
          userId,
          organizationId: invitation.organizationId,
          userRole: invitation.role,
        },
      });

      await tx.organizationInvitation.delete({
        where: { id: invitation.id },
      });

      return { status: 201, message: "Invitation acceptée avec succès !" };
    });
  }

  async leaveOrganization(userId: string, body: LeaveOrganizationDTO) {
    try {
      const member = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: body.organizationId,
          },
        },
      });

      if (!member) {
        throw new NotFoundException("Vous ne faites pas partie de cette organisation.");
      }

      // Règle cruciale : Un OWNER ne peut pas quitter sans transférer
      if (member.userRole === OrganizationRole.OWNER) {
        throw new ForbiddenException(
          "Le propriétaire ne peut pas quitter l'organisation. Vous devez transférer la propriété ou supprimer l'organisation."
        );
      }

      await this.prisma.organizationMember.delete({
        where: { id: member.id },
      });

      return {
        statusCode: 200,
        message: "Vous avez quitté l'organisation avec succès.",
      };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la tentative de quitter l'organisation.");
    }
  }
}