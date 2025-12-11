import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { OrganizationRole } from '../utils/organization.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationInvitationDTO {
  @ApiProperty({
    description: "The newcomer's mail where we want to send the invitation",
    example: 'test@gmail.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The role we want the newcomer to have in the organization',
    example: 'STUDENT',
  })
  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @ApiProperty({
    description: "The organization's id where we create the invitation",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  organizationId: string;
}

export class GetInformationOrganizationDTO {
  @ApiProperty({
    description: "The organization's id where we'll get the information from",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  organizationId: string;
}

export class JoinOrganizationDTO {
  @ApiProperty({
    description: 'The role inside the invitation',
    example: 'STUDENT',
  })
  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @ApiProperty({
    description: "The organization's id that the user will join",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  organizationId: string;

  @ApiProperty({
    description: "The invitation's id as an uuid",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  invitationId: string;
}

export class ChangeMemberRoleDTO extends GetInformationOrganizationDTO {
  @ApiProperty({
    description: "The member's id we want to change the role from",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  memberId: string;

  @ApiProperty({
    description: 'The new role wanted for the user',
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}

export class KickMemberFromOrganizationDTO {
  @ApiProperty({
    description: 'The id of the user we want to kick',
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  memberId: string;

  @ApiProperty({
    description: "The organization's id where we'll kick the user from",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  organizationId: string;
}

export class ChangeOrganizationOwnerDTO {
  @ApiProperty({
    description: "The new owner of the organization's UUID",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  newOwnerId: string;

  @ApiProperty({
    description: "The organization's id we want to change the owner from",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  organizationId: string;
}

export class RevokeOrganizationInvitationDTO {
  @ApiProperty({
    description: "The invitation's id we want to revoke",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  invitationId: string;

  @ApiProperty({
    description: "The organization's id we want to revoke the invitation from",
    example: 'd70380aa-f5f1-444e-c3c1-9c3196b3580a',
  })
  @IsString()
  @IsUUID('4', { message: 'The ID need to be an UUID' })
  organizationId: string;
}

export class EditInvitationRoleDTO extends RevokeOrganizationInvitationDTO {
  @ApiProperty({
    description: "The role we want to change to, inside the invitation",
    example: 'STUDENT',
  })
  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}

export class AcceptInvitationDTO {
  @ApiProperty({
    description: "Le token d'invitation reçu par email",
    example: "a4f8e9d2..."
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class LeaveOrganizationDTO {
  @ApiProperty({
    description: "L'ID de l'organisation que l'utilisateur souhaite quitter",
    example: "c56a4180-65aa-42ec-a945-5fd21dec0538"
  })
  @IsString()
  @IsNotEmpty()
  organizationId: string;
}