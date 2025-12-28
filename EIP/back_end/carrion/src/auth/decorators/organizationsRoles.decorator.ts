import { SetMetadata } from '@nestjs/common';
import { OrganizationRole } from '@prisma/client';

export const ROLES_KEY = 'organization_roles';
export const OrgRoles = (...roles: OrganizationRole[]) => SetMetadata(ROLES_KEY, roles);