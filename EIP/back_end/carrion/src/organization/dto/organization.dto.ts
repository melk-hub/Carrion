import { OrganizationRole } from '../utils/organization.enum';

export interface CreateOrganizationInvitationDTO {
  email: string;
  role: OrganizationRole;
  organizationId: string;
}

export interface GetInformationOrganizationDTO {
  organizationId: string;
  role: OrganizationRole;
}

export interface ChangeMemberRoleDTO extends GetInformationOrganizationDTO {
  memberId: string;
}

export interface KickMemberFromOrganizationDTO {
  memberId: string;
  organizationId: string;
}