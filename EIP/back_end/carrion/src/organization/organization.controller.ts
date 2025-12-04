import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  Query,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import {
  ChangeMemberRoleDTO,
  ChangeOrganizationOwnerDTO,
  CreateOrganizationInvitationDTO,
  EditInvitationRoleDTO,
  GetInformationOrganizationDTO,
  JoinOrganizationDTO,
  KickMemberFromOrganizationDTO,
  RevokeOrganizationInvitationDTO,
} from './dto/organization.dto';
import { OrgRoles } from '@/auth/decorators/organizationsRoles.decorator';

@Controller('organization')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('')
  async getOrganizationInfo(@Request() req) {
    return this.organizationService.getUserOrganization(req.user.id);
  }

  @Post('join')
  async joinOrganization(@Request() req, @Body() body: JoinOrganizationDTO) {
    return this.organizationService.joinOrganization(req.user.id, body);
  }

  @OrgRoles('OWNER', 'TEACHER')
  @Post('invite')
  async sendInvitationToOrganization(
    @Request() req,
    @Body() body: CreateOrganizationInvitationDTO,
  ) {
    const userId: string = req.user.id;
    return this.organizationService.sendInvitationToOrganization(userId, body);
  }

  @Get('get-info')
  async getOrganizationInformation(
    @Query() query: GetInformationOrganizationDTO,
  ) {
    return this.organizationService.getOrganizationInformation(query);
  }

  @OrgRoles('OWNER')
  @Put('edit-role')
  async editMemberRole(@Body() body: ChangeMemberRoleDTO) {
    return this.organizationService.editMemberRole(body);
  }

  @OrgRoles('OWNER')
  @Delete('kick-member')
  async kickMember(@Body() body: KickMemberFromOrganizationDTO) {
    return this.organizationService.kickMemberFromOrganization(body);
  }

  @OrgRoles('OWNER', 'TEACHER')
  @Get('settings-data')
  async getInvitationList(@Query('organizationId') organizationId: string) {
    return this.organizationService.getOrganizationSettingsData(organizationId);
  }

  @OrgRoles('OWNER')
  @Put('edit-invitation-role')
  async editInvitationRole(
    @Request() req,
    @Body() body: EditInvitationRoleDTO,
  ) {
    return this.organizationService.editInvitationRole(req.user.id, body);
  }

  @OrgRoles('OWNER', 'TEACHER')
  @Delete('revoke-invitation')
  async revokeOrganizationInvitation(
    @Request() req,
    @Body() body: RevokeOrganizationInvitationDTO,
  ) {
    return this.organizationService.revokeOrganizationInvitation(
      req.user.id,
      body,
    );
  }
}
