import { OrganizationRole } from '../utils/organization.enum';

export interface JoinOrganizationDTO {
  organizationId: string;
  userRole: OrganizationRole;
}

export interface CreateOrganizationInvitationDTO {
  email: string;
  role: OrganizationRole;
  organizationId: string;
}
