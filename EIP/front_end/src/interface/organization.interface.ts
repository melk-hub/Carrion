import { OrganizationRole } from "@/enum/organization.enum";

export interface OrganizationMemberInfo {
  userRole: OrganizationRole;
  organizationId: string;
  userId: string;
}
