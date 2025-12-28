import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { ROLES_KEY } from '../../decorators/organizationsRoles.decorator';
import { OrganizationRole } from '@prisma/client';

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const organizationId =
      request.body.organizationId ||
      request.params.organizationId ||
      request.query.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is missing');
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      select: { userRole: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (!requiredRoles.includes(member.userRole)) {
      throw new ForbiddenException(
        `Requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    request.organizationMember = member;

    return true;
  }
}
