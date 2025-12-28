import { OrganizationRole } from "@/enum/organization.enum";

export interface OrganizationMemberInfo {
  userRole: OrganizationRole;
  organizationId: string;
  userId: string;
}

export interface InvitationListInterface {
  id: string;
  email: string;
  expiresAt: string;
  role: OrganizationRole;
  inviter: {
    email: string;
  }
}

export interface MemberListInterface {
  user: {
    id: string;
    email: string
  }
}

export interface SettingsDataInterface {
  invitationList: InvitationListInterface[]
  memberList: MemberListInterface[]
}